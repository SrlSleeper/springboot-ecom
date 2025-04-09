package com.appdev.set.service.user;

import com.appdev.set.dto.user.PasswordResetDto;
import com.appdev.set.dto.user.UserDto;
import com.appdev.set.dto.user.UserRegistrationDto;
import com.appdev.set.model.user.User;

public interface UserService {
    User registerNewUser(UserRegistrationDto registrationDto);
    void verifyEmail(String token);
    void initiatePasswordReset(String email);
    void resetPassword(PasswordResetDto passwordResetDto);
    boolean checkIfUserExists(String email);
    UserDto getUserProfile(String email);
    void updateUserProfile(String email, UserDto userDto);
}

