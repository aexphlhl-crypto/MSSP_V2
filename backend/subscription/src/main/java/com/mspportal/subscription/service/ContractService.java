package com.mspportal.subscription.service;

import com.mspportal.common.tenant.TenantContext;
import com.mspportal.subscription.dto.ContractResponse;
import com.mspportal.subscription.dto.ContractSummaryResponse;
import com.mspportal.subscription.entity.Contract;
import com.mspportal.subscription.repository.ContractRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ContractService {

    private final ContractRepository contractRepository;

    public ContractService(ContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    private boolean isPlatformUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PLATFORM_ADMIN")
                        || a.getAuthority().equals("ROLE_PLATFORM_TECH"));
    }

    private String getEffectiveTenantId(String requestedTenantId) {
        if (isPlatformUser() && requestedTenantId != null && !requestedTenantId.isBlank()) {
            return requestedTenantId;
        }
        return TenantContext.getCurrentTenant();
    }

    @Transactional(readOnly = true)
    public Page<ContractResponse> listContracts(String requestedTenantId, Pageable pageable) {
        String tenantId = getEffectiveTenantId(requestedTenantId);
        if (tenantId == null) {
            return Page.empty(pageable);
        }

        List<Contract> allContracts = contractRepository.findByCustomerAccountTenantId(tenantId);
        
        // Paginate in memory since JpaSpecificationExecutor on a join without @TenantId is safer this way
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allContracts.size());
        
        List<ContractResponse> pagedList = allContracts.stream()
                .skip(start)
                .limit(pageable.getPageSize())
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(pagedList, pageable, allContracts.size());
    }

    @Transactional(readOnly = true)
    public ContractSummaryResponse getSummary(String requestedTenantId) {
        String tenantId = getEffectiveTenantId(requestedTenantId);
        ContractSummaryResponse summary = new ContractSummaryResponse();
        
        if (tenantId == null) {
            return summary;
        }

        List<Contract> contracts = contractRepository.findByCustomerAccountTenantId(tenantId);
        Instant now = Instant.now();
        Instant thirtyDaysFromNow = now.plus(30, ChronoUnit.DAYS);

        long total = contracts.size();
        long active = contracts.stream().filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus())).count();
        long expired = contracts.stream().filter(c -> "EXPIRED".equalsIgnoreCase(c.getStatus()) || (c.getEndDate() != null && c.getEndDate().isBefore(now))).count();
        long expiringSoon = contracts.stream()
                .filter(c -> !"EXPIRED".equalsIgnoreCase(c.getStatus()) 
                        && c.getEndDate() != null 
                        && c.getEndDate().isAfter(now) 
                        && c.getEndDate().isBefore(thirtyDaysFromNow))
                .count();

        summary.setTotalContracts(total);
        summary.setActiveContracts(active);
        summary.setExpiredContracts(expired);
        summary.setExpiringSoonContracts(expiringSoon);

        return summary;
    }

    @Transactional(readOnly = true)
    public ContractResponse getContract(UUID id, String requestedTenantId) {
        String tenantId = getEffectiveTenantId(requestedTenantId);
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (tenantId != null && !tenantId.equals(contract.getCustomerAccount().getTenantId())) {
            throw new RuntimeException("Access Denied: Contract does not belong to this tenant");
        }

        return mapToResponse(contract);
    }

    private ContractResponse mapToResponse(Contract c) {
        ContractResponse res = new ContractResponse();
        res.setId(c.getId());
        res.setCustomerAccountId(c.getCustomerAccount().getId());
        res.setAccountName(c.getCustomerAccount().getAccountName());
        res.setTenantId(c.getCustomerAccount().getTenantId());
        res.setStatus(c.getStatus());
        res.setStartDate(c.getStartDate());
        res.setEndDate(c.getEndDate());
        res.setCreatedAt(c.getCreatedAt());
        res.setUpdatedAt(c.getUpdatedAt());
        return res;
    }
}
