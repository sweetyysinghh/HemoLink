package com.hemolink.backend.identity.repository;

import com.hemolink.backend.identity.model.Role;
import com.hemolink.backend.identity.model.RoleName;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
	Optional<Role> findByName(RoleName name);
}
