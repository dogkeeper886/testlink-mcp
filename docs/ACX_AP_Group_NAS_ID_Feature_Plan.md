# ACX AP Group NAS-ID Feature - TestLink Project Plan

## Project Overview

**Project Name:** ACX AP Group NAS-ID Feature  
**Project Prefix:** APG  
**Target Release:** R7.1.2  
**Business Value:** 93/100  
**Priority:** Major  

## Related Jira Tickets

- **FR-9658:** AP - Add AP Group name to the NAS-ID P3 (Main Feature Request)
- **ACX-90908:** R1 - Add AP Group name to the NAS-ID P3 (Implementation)
- **AP-47407:** [AP support FR-8365] R1 - Add AP Group name to the NAS-ID (Epic)
- **FR-8365:** Original feature request (cloned from)

## Project Description

TestLink project for AP Group name enhancement in NAS-ID functionality. This project covers comprehensive testing of the new AP Group name option in NAS-ID dropdown, including firmware compatibility, RADIUS integration, and fallback logic for the R7.1.2 release.

## Test Suites Structure

### 1. AP Group Management Testing
**Suite Name:** AP Group Management  
**Description:** Core AP Group functionality testing  
**Test Cases:**
- AP Group creation and configuration
- AP Group name validation
- AP Group parameter handling
- AP Group deletion and cleanup

### 2. NAS-ID Configuration Testing
**Suite Name:** NAS-ID Configuration  
**Description:** Dropdown options and parameter handling  
**Test Cases:**
- NAS-ID dropdown options verification
- AP Group name option selection
- Parameter validation and configuration
- Configuration persistence testing

### 3. Firmware Compatibility Testing
**Suite Name:** Firmware Compatibility  
**Description:** Old vs new AP firmware support  
**Test Cases:**
- New firmware AP Group name support
- Old firmware fallback to AP_MAC
- Old firmware fallback to Venue Name
- Mixed firmware environment testing

### 4. RADIUS Integration Testing
**Suite Name:** RADIUS Integration  
**Description:** Server communication with new NAS-ID format  
**Test Cases:**
- RADIUS server communication with AP Group name
- NAS-ID format validation on RADIUS server
- Authentication flow testing
- Authorization policy testing

### 5. Fallback Logic Testing
**Suite Name:** Fallback Logic  
**Description:** AP_MAC and Venue Name defaults  
**Test Cases:**
- AP_MAC fallback for old firmware
- Venue Name fallback for old firmware
- Fallback priority testing
- Error handling scenarios

### 6. Regression Testing
**Suite Name:** Regression Testing  
**Description:** Ensure existing functionality isn't broken  
**Test Cases:**
- Existing AP MAC option functionality
- Existing Venue Name option functionality
- Existing NAS-ID configurations
- Backward compatibility testing

## Test Plan Structure

### Test Plan: ACX AP Group NAS-ID R7.1.2
**Description:** Comprehensive test plan for AP Group NAS-ID feature  
**Active:** Yes  
**Public:** Yes  

### Builds:
- **Build 1:** R7.1.2 Alpha - Initial development testing
- **Build 2:** R7.1.2 Beta - Feature complete testing
- **Build 3:** R7.1.2 RC - Release candidate testing
- **Build 4:** R7.1.2 GA - General availability testing

## Test Case Categories

### Functional Testing
- AP Group name selection and configuration
- NAS-ID dropdown functionality
- Parameter validation and error handling
- Configuration persistence and retrieval

### Compatibility Testing
- Firmware version detection
- Backward compatibility with old APs
- Forward compatibility with new features
- Mixed environment testing

### Integration Testing
- RADIUS server communication
- Authentication flow integration
- Authorization policy integration
- Network infrastructure compatibility

### Performance Testing
- Configuration change performance
- RADIUS authentication performance
- Large-scale deployment testing
- Resource utilization testing

### Security Testing
- NAS-ID security validation
- Authentication security
- Authorization security
- Data integrity testing

## Test Data Requirements

### AP Groups
- Test AP Group 1: "Office-Floor1"
- Test AP Group 2: "Conference-Rooms"
- Test AP Group 3: "Guest-Area"
- Test AP Group 4: "Special-Characters-!@#$%"

### AP Firmware Versions
- New firmware: 7.1.2+ (supports AP Group name)
- Old firmware: 7.1.1 and below (fallback to AP_MAC/Venue)
- Mixed environment: Both versions present

### RADIUS Server Configurations
- Primary RADIUS server
- Secondary RADIUS server
- Load-balanced RADIUS servers
- Different NAS-ID formats

## Success Criteria

### Functional Success
- [ ] AP Group name option appears in NAS-ID dropdown
- [ ] AP Group name is correctly sent to RADIUS server
- [ ] Old firmware APs fallback to AP_MAC or Venue Name
- [ ] Configuration changes persist across reboots
- [ ] Error handling works for invalid configurations

### Performance Success
- [ ] Configuration changes complete within 30 seconds
- [ ] RADIUS authentication completes within 5 seconds
- [ ] No performance degradation in existing functionality
- [ ] System handles 1000+ APs with AP Group names

### Security Success
- [ ] NAS-ID format is validated before sending to RADIUS
- [ ] No sensitive information exposed in logs
- [ ] Authentication flow remains secure
- [ ] Authorization policies work correctly

## Risk Assessment

### High Risk
- **Firmware Compatibility:** Old APs may not handle new NAS-ID format
- **RADIUS Integration:** Server may not recognize new NAS-ID format
- **Performance Impact:** Large-scale deployments may have performance issues

### Medium Risk
- **Configuration Complexity:** Users may find new options confusing
- **Backward Compatibility:** Existing configurations may be affected
- **Testing Coverage:** Complex scenarios may be missed

### Low Risk
- **UI Changes:** Dropdown addition is straightforward
- **Documentation:** Well-documented feature
- **Rollback:** Feature can be disabled if issues arise

## Timeline

### Phase 1: Project Setup (Week 1)
- Create TestLink project structure
- Set up test suites and test cases
- Prepare test data and environments
- Review requirements and acceptance criteria

### Phase 2: Development Testing (Weeks 2-3)
- Test with development builds
- Verify basic functionality
- Identify and report issues
- Refine test cases based on findings

### Phase 3: Integration Testing (Weeks 4-5)
- Test with integration builds
- Verify RADIUS server compatibility
- Test firmware compatibility scenarios
- Performance and security testing

### Phase 4: Release Testing (Weeks 6-7)
- Test with release candidate builds
- Final regression testing
- User acceptance testing
- Production readiness verification

### Phase 5: Post-Release (Week 8+)
- Monitor production deployments
- Collect user feedback
- Address any post-release issues
- Update documentation and test cases

## Dependencies

### External Dependencies
- AP firmware development completion
- RADIUS server configuration updates
- Network infrastructure readiness
- User training and documentation

### Internal Dependencies
- Test environment setup
- Test data preparation
- Test case development
- Test execution resources

## Deliverables

### Test Documentation
- Test plan document
- Test case specifications
- Test execution reports
- Defect reports and tracking

### Test Results
- Functional test results
- Performance test results
- Security test results
- Compatibility test results

### Recommendations
- Go/no-go recommendation for release
- Risk assessment and mitigation strategies
- Performance optimization recommendations
- User training recommendations

## Notes

This plan is based on the analysis of Jira tickets FR-9658, ACX-90908, and AP-47407. The project structure follows TestLink best practices and covers all aspects of the AP Group NAS-ID feature testing.

**Last Updated:** [Current Date]  
**Version:** 1.0  
**Status:** Draft  
**Owner:** QA Team  
