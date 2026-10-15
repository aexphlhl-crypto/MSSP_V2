package com.mspportal.monitoring.controller;

import com.mspportal.monitoring.dto.CreateDeviceRequest;
import com.mspportal.monitoring.dto.DeviceDetailResponse;
import com.mspportal.monitoring.dto.DeviceResponse;
import com.mspportal.monitoring.dto.UpdateDeviceRequest;
import com.mspportal.monitoring.service.DeviceService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/monitoring/devices")
@PreAuthorize("@entitlement.has('MONITORING_BASIC')")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @PostMapping("/import")
    public com.mspportal.monitoring.dto.ImportDeviceResult importDevices(
            @RequestBody com.mspportal.monitoring.dto.ImportDeviceRequest request,
            @RequestParam(required = false) String tenantId) {
        return deviceService.importDevices(request, tenantId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeviceResponse createDevice(@RequestBody CreateDeviceRequest request,
                                       @RequestParam(required = false) String tenantId) {
        return deviceService.createDevice(request, tenantId);
    }

    @GetMapping
    public List<DeviceResponse> listDevices(@RequestParam(required = false) String tenantId,
                                            @RequestParam(required = false) UUID siteId) {
        return deviceService.listDevices(tenantId, siteId);
    }

    @GetMapping("/{id}")
    public DeviceResponse getDevice(@PathVariable UUID id,
                                    @RequestParam(required = false) String tenantId) {
        return deviceService.getDevice(id, tenantId);
    }

    @GetMapping("/{id}/detail")
    public DeviceDetailResponse getDeviceDetail(@PathVariable UUID id,
                                                @RequestParam(required = false) String tenantId) {
        return deviceService.getDeviceDetail(id, tenantId);
    }

    @PatchMapping("/{id}")
    public DeviceResponse updateDevice(@PathVariable UUID id,
                                       @RequestBody UpdateDeviceRequest request,
                                       @RequestParam(required = false) String tenantId) {
        return deviceService.updateDevice(id, request, tenantId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDevice(@PathVariable UUID id,
                             @RequestParam(required = false) String tenantId) {
        deviceService.deleteDevice(id, tenantId);
    }
}
