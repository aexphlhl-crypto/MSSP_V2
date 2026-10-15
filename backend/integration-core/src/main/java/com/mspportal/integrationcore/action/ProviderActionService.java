package com.mspportal.integrationcore.action;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProviderActionService {

    private final ProviderActionRepository actionRepository;
    private final ActionApprovalRepository approvalRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public ProviderAction requestAction(UUID tenantId, String providerId, String actionType,
                                        String targetEntityId, UUID initiatedBy, boolean requiresApproval) {
        
        String initialStatus = requiresApproval ? "PENDING_APPROVAL" : "APPROVED";
        
        ProviderAction action = ProviderAction.builder()
                .tenantId(tenantId)
                .providerId(providerId)
                .actionType(actionType)
                .targetEntityId(targetEntityId)
                .status(initialStatus)
                .initiatedBy(initiatedBy)
                .build();
                
        action = actionRepository.save(action);

        if (requiresApproval) {
            ActionApproval approval = ActionApproval.builder()
                    .tenantId(tenantId)
                    .providerActionId(action.getId())
                    .status("PENDING")
                    .build();
            approvalRepository.save(approval);
        }
        
        auditLogRepository.save(AuditLog.builder()
                .tenantId(tenantId)
                .userId(initiatedBy)
                .action("REQUEST_ACTION")
                .resourceType("ProviderAction")
                .resourceId(action.getId().toString())
                .details("Action " + actionType + " requested for provider " + providerId)
                .build());

        return action;
    }

    @Transactional
    public ProviderAction approveAction(UUID actionId, UUID approverId, String reason) {
        ProviderAction action = actionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action not found"));

        if (!"PENDING_APPROVAL".equals(action.getStatus())) {
            throw new IllegalStateException("Action is not pending approval");
        }

        ActionApproval approval = approvalRepository.findByProviderActionId(actionId)
                .stream().filter(a -> "PENDING".equals(a.getStatus()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No pending approval found"));

        approval.setStatus("APPROVED");
        approval.setApproverId(approverId);
        approval.setActedAt(OffsetDateTime.now());
        approval.setReason(reason);
        approvalRepository.save(approval);

        action.setStatus("APPROVED");
        action = actionRepository.save(action);
        
        auditLogRepository.save(AuditLog.builder()
                .tenantId(action.getTenantId())
                .userId(approverId)
                .action("APPROVE_ACTION")
                .resourceType("ProviderAction")
                .resourceId(action.getId().toString())
                .details("Action approved. Reason: " + reason)
                .build());

        return action;
    }
    
    @Transactional
    public ProviderAction rejectAction(UUID actionId, UUID approverId, String reason) {
        ProviderAction action = actionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action not found"));

        if (!"PENDING_APPROVAL".equals(action.getStatus())) {
            throw new IllegalStateException("Action is not pending approval");
        }

        ActionApproval approval = approvalRepository.findByProviderActionId(actionId)
                .stream().filter(a -> "PENDING".equals(a.getStatus()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No pending approval found"));

        approval.setStatus("REJECTED");
        approval.setApproverId(approverId);
        approval.setActedAt(OffsetDateTime.now());
        approval.setReason(reason);
        approvalRepository.save(approval);

        action.setStatus("REJECTED");
        action = actionRepository.save(action);
        
        auditLogRepository.save(AuditLog.builder()
                .tenantId(action.getTenantId())
                .userId(approverId)
                .action("REJECT_ACTION")
                .resourceType("ProviderAction")
                .resourceId(action.getId().toString())
                .details("Action rejected. Reason: " + reason)
                .build());

        return action;
    }
}
