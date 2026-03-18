package app.authservice.service;

import app.authservice.dto.UserLoginRequestDto;
import app.authservice.dto.UserRegisterRequestDto;
import app.authservice.dto.UserResponseDto;
import app.authservice.entity.User;
import app.authservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.UUID;

public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
//    public UserResponseDto Register(UserRegisterRequestDto request){
//        try{
//            String hash = passwordEncoder.encode(request.password());
//            String email = request.email();
//            UUID id = UUID.randomUUID();
//
//            User newUser = new User(
//                    id,
//                    email,
//                    hash,
//                    true, // user is enable
//                    false, // the email is not verified yet
//                    Instant.now(),
//                    Instant.now()
//            );
//            userRepository.save(newUser);
//            return new UserResponseDto(
//                    email,
//                    "Created"
//            );
//        } catch (RuntimeException e){
//            throw new RuntimeException("The user failed to be created!");
//        }
//
//    }


}
