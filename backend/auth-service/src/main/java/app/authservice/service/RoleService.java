package app.authservice.service;

import app.authservice.entity.Role;
import app.authservice.repository.RoleRepository;
import org.springframework.stereotype.Service;

@Service
public class RoleService {
    private final RoleRepository roleRepository;
    public RoleService(RoleRepository roleRepository){
        this.roleRepository = roleRepository;
    }

    public Role findRoleByName(String name){

        return roleRepository
                .findByName(name)
                .orElseThrow(() -> new IllegalStateException(
                        "Critical Error: Role " +
                                name + " " +
                        "is missing from the database. Check Flyway migrations."));
    }

}
