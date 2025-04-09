package com.appdev.set.controller.auth;

import com.appdev.set.dto.user.PasswordResetDto;
import com.appdev.set.dto.user.UserRegistrationDto;
import com.appdev.set.service.user.UserService;
import jakarta.validation.Valid;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
		this.userService = null;
    }

    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("user", new UserRegistrationDto());
        return "auth/register";
    }

    @PostMapping("/register")
    public String registerUser(@Valid @ModelAttribute("user") UserRegistrationDto userDto,
                         BindingResult result, Model model) {
        
        // Check if passwords match
        if (!userDto.getPassword().equals(userDto.getConfirmPassword())) {
            result.rejectValue("confirmPassword", "error.user", "Passwords do not match");
        }
        
        // Check if email already exists
        if (userService.checkIfUserExists(userDto.getEmail())) {
            result.rejectValue("email", "error.user", "Email already in use");
        }
        
        if (result.hasErrors()) {
            return "auth/register";
        }
        
        try {
            userService.registerNewUser(userDto);
            model.addAttribute("success", "Registration successful! Please check your email to verify your account.");
            return "auth/registration-success";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            return "auth/register";
        }
    }

    @GetMapping("/verify-email")
    public String verifyEmail(@RequestParam String token, RedirectAttributes redirectAttributes) {
        try {
            userService.verifyEmail(token);
            redirectAttributes.addFlashAttribute("success", "Your email has been verified successfully. You can now login.");
            return "redirect:/auth/login";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/auth/login";
        }
    }

    @GetMapping("/login")
    public String showLoginForm() {
        return "auth/login";
    }

    @GetMapping("/forgot-password")
    public String showForgotPasswordForm() {
        return "auth/forgot-password";
    }

    @PostMapping("/forgot-password")
    public String processForgotPassword(@RequestParam("email") String email, RedirectAttributes redirectAttributes) {
        try {
            userService.initiatePasswordReset(email);
            redirectAttributes.addFlashAttribute("success", "If an account exists with that email, we've sent password reset instructions.");
            return "redirect:/auth/login";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "An error occurred. Please try again.");
            return "redirect:/auth/forgot-password";
        }
    }

    @GetMapping("/reset-password")
    public String showResetPasswordForm(@RequestParam("token") String token, Model model) {
        PasswordResetDto passwordResetDto = new PasswordResetDto();
        passwordResetDto.setToken(token);
        model.addAttribute("passwordResetDto", passwordResetDto);
        return "auth/reset-password";
    }

    @PostMapping("/reset-password")
    public String processResetPassword(@Valid @ModelAttribute("passwordResetDto") PasswordResetDto passwordResetDto,
                                      BindingResult result, RedirectAttributes redirectAttributes) {
        
        if (!passwordResetDto.getPassword().equals(passwordResetDto.getConfirmPassword())) {
            result.rejectValue("confirmPassword", "error.passwordResetDto", "Passwords do not match");
        }
        
        if (result.hasErrors()) {
            return "auth/reset-password";
        }
        
        try {
            userService.resetPassword(passwordResetDto);
            redirectAttributes.addFlashAttribute("success", "Your password has been reset successfully. You can now login with your new password.");
            return "redirect:/auth/login";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/auth/reset-password?token=" + passwordResetDto.getToken();
        }
    }
}
