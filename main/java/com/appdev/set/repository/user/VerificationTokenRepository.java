package com.appdev.set.repository.user;

import com.appdev.set.model.user.User;
import com.appdev.set.model.user.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUserAndTokenType(User user, VerificationToken.TokenType tokenType);
}

