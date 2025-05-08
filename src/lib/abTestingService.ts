import { v4 as uuidv4 } from 'uuid';
import type { 
  ABTest, 
  ABTestVariant,
  UserTestAssignment
} from '../types/analytics';
import { trackEvent } from './analyticsService';

// Mock implementation toggle
const USE_MOCK_AB_TESTING = true;

// In-memory storage for mock A/B tests
let mockTests: ABTest[] = [];
let mockAssignments: UserTestAssignment[] = [];

// LocalStorage keys
const LS_USER_ASSIGNMENTS = 'lawnsync_ab_test_assignments';

/**
 * Create a new A/B test
 */
export const createABTest = async (
  name: string,
  description: string,
  variants: Omit<ABTestVariant, 'id' | 'userCount'>[],
  targetUserPercentage: number,
  metrics: string[],
  targetUserCriteria?: Record<string, any>,
  startDate: string = new Date().toISOString(),
  endDate?: string
): Promise<ABTest | null> => {
  try {
    if (!variants.some(v => v.controlGroup)) {
      throw new Error('At least one variant must be marked as the control group');
    }

    // Create test with variants
    const newTest: ABTest = {
      id: uuidv4(),
      name,
      description,
      isActive: true,
      startDate,
      endDate,
      variants: variants.map(variant => ({
        ...variant,
        id: uuidv4(),
        userCount: 0
      })),
      targetUserPercentage,
      targetUserCriteria,
      metrics,
      createdBy: 'system'
    };

    if (USE_MOCK_AB_TESTING) {
      console.log('Using mock A/B testing implementation');
      mockTests.push(newTest);
      console.log('A/B test created:', newTest);
      return newTest;
    }

    // TODO: Implement Firestore version when ready
    return newTest;
  } catch (error) {
    console.error('Error creating A/B test:', error);
    return null;
  }
};

/**
 * Get all A/B tests
 */
export const getAllABTests = async (): Promise<ABTest[]> => {
  if (USE_MOCK_AB_TESTING) {
    return [...mockTests];
  }

  // TODO: Implement Firestore version when ready
  return [];
};

/**
 * Get an A/B test by ID
 */
export const getABTestById = async (id: string): Promise<ABTest | null> => {
  if (USE_MOCK_AB_TESTING) {
    return mockTests.find(test => test.id === id) || null;
  }

  // TODO: Implement Firestore version when ready
  return null;
};

/**
 * Determine if a user should be included in A/B testing
 * Based on the test's target percentage and user criteria
 */
const shouldAssignToTest = (
  test: ABTest, 
  userId: string, 
  userProperties?: Record<string, any>
): boolean => {
  // Check if test is active
  if (!test.isActive) {
    return false;
  }

  // Check if end date has passed
  if (test.endDate && new Date(test.endDate) < new Date()) {
    return false;
  }

  // Deterministic random value based on userId and testId
  // This ensures the same user always gets the same decision for a given test
  const hash = (userId + test.id).split('').reduce((a, b) => {
    return (((a << 5) - a) + b.charCodeAt(0)) | 0;
  }, 0);
  
  const normalizedHash = Math.abs(hash) / 2147483647; // Max 32-bit signed int value
  
  // Check if user should be in the test based on target percentage
  if (normalizedHash > (test.targetUserPercentage / 100)) {
    return false;
  }

  // Check if user meets criteria (if any)
  if (test.targetUserCriteria && userProperties) {
    for (const [key, value] of Object.entries(test.targetUserCriteria)) {
      if (userProperties[key] !== value) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Assign a user to a test variant
 */
export const assignUserToTest = async (
  userId: string,
  testId: string,
  userProperties?: Record<string, any>
): Promise<UserTestAssignment | null> => {
  try {
    // Check if user is already assigned to this test
    const existingAssignment = await getUserTestAssignment(userId, testId);
    if (existingAssignment) {
      return existingAssignment;
    }

    // Get the test
    const test = await getABTestById(testId);
    if (!test) {
      throw new Error(`Test with ID ${testId} not found`);
    }

    // Check if user should be in test
    if (!shouldAssignToTest(test, userId, userProperties)) {
      return null;
    }

    // Determine which variant to assign
    // This uses a deterministic hash so the same user gets the same variant
    const hash = (userId + testId).split('').reduce((a, b) => {
      return (((a << 5) - a) + b.charCodeAt(0)) | 0;
    }, 0);
    
    const variantIndex = Math.abs(hash) % test.variants.length;
    const variant = test.variants[variantIndex];

    // Create assignment
    const assignment: UserTestAssignment = {
      userId,
      testId,
      variantId: variant.id,
      assignedAt: new Date().toISOString(),
      hasInteracted: false,
      conversionEvents: []
    };

    if (USE_MOCK_AB_TESTING) {
      mockAssignments.push(assignment);
      
      // Update variant user count
      const testIndex = mockTests.findIndex(t => t.id === testId);
      if (testIndex !== -1) {
        const variantIndex = mockTests[testIndex].variants.findIndex(v => v.id === variant.id);
        if (variantIndex !== -1) {
          mockTests[testIndex].variants[variantIndex].userCount++;
        }
      }
      
      // Store in localStorage for persistence
      try {
        const storedAssignments = JSON.parse(localStorage.getItem(LS_USER_ASSIGNMENTS) || '[]');
        storedAssignments.push(assignment);
        localStorage.setItem(LS_USER_ASSIGNMENTS, JSON.stringify(storedAssignments));
      } catch (e) {
        console.error('Error storing test assignment in localStorage:', e);
      }
      
      // Track the event
      trackEvent('test_assigned', {
        testId,
        testName: test.name,
        variantId: variant.id,
        variantName: variant.name
      });
      
      return assignment;
    }

    // TODO: Implement Firestore version when ready
    return assignment;
  } catch (error) {
    console.error('Error assigning user to test:', error);
    return null;
  }
};

/**
 * Get a user's assignment for a specific test
 */
export const getUserTestAssignment = async (
  userId: string,
  testId: string
): Promise<UserTestAssignment | null> => {
  if (USE_MOCK_AB_TESTING) {
    // First check in-memory assignments
    const memoryAssignment = mockAssignments.find(
      a => a.userId === userId && a.testId === testId
    );
    
    if (memoryAssignment) {
      return memoryAssignment;
    }
    
    // Then check localStorage
    try {
      const storedAssignments = JSON.parse(localStorage.getItem(LS_USER_ASSIGNMENTS) || '[]');
      const assignment = storedAssignments.find(
        (a: UserTestAssignment) => a.userId === userId && a.testId === testId
      );
      
      if (assignment) {
        // Add to in-memory cache
        mockAssignments.push(assignment);
        return assignment;
      }
    } catch (e) {
      console.error('Error retrieving test assignment from localStorage:', e);
    }
    
    return null;
  }

  // TODO: Implement Firestore version when ready
  return null;
};

/**
 * Get all test assignments for a user
 */
export const getUserTestAssignments = async (
  userId: string
): Promise<UserTestAssignment[]> => {
  if (USE_MOCK_AB_TESTING) {
    // Combine in-memory and localStorage assignments
    const memoryAssignments = mockAssignments.filter(a => a.userId === userId);
    
    try {
      const storedAssignments = JSON.parse(localStorage.getItem(LS_USER_ASSIGNMENTS) || '[]');
      const localStorageAssignments = storedAssignments.filter(
        (a: UserTestAssignment) => a.userId === userId
      );
      
      // Merge, preferring in-memory assignments
      const assignmentMap = new Map<string, UserTestAssignment>();
      
      [...localStorageAssignments, ...memoryAssignments].forEach(assignment => {
        assignmentMap.set(assignment.testId, assignment);
      });
      
      return Array.from(assignmentMap.values());
    } catch (e) {
      console.error('Error retrieving test assignments from localStorage:', e);
      return memoryAssignments;
    }
  }

  // TODO: Implement Firestore version when ready
  return [];
};

/**
 * Check if a feature flag is enabled for a user
 * This is used to dynamically enable/disable features based on A/B tests
 */
export const isFeatureEnabled = async (
  userId: string,
  featureKey: string
): Promise<boolean> => {
  try {
    // Get all tests
    const tests = await getAllABTests();
    
    // Find active tests that might control this feature
    const activeTests = tests.filter(test => 
      test.isActive && 
      !test.winner && 
      test.variants.some(v => v.featureToggle === featureKey)
    );
    
    if (activeTests.length === 0) {
      // No tests control this feature, default to enabled
      return true;
    }
    
    // Get user assignments for these tests
    const assignments = [];
    for (const test of activeTests) {
      const assignment = await getUserTestAssignment(userId, test.id);
      if (assignment) {
        assignments.push(assignment);
      }
    }
    
    if (assignments.length === 0) {
      // User not in any relevant tests, default to control group behavior
      const controlVariants = activeTests.flatMap(test => 
        test.variants.filter(v => v.controlGroup)
      );
      
      // Check if any control variant has this feature enabled
      return controlVariants.some(v => v.featureToggle === featureKey);
    }
    
    // Check if any assigned variant has this feature enabled
    for (const assignment of assignments) {
      const test = activeTests.find(t => t.id === assignment.testId);
      if (!test) continue;
      
      const variant = test.variants.find(v => v.id === assignment.variantId);
      if (!variant) continue;
      
      if (variant.featureToggle === featureKey) {
        return true;
      }
    }
    
    // No variant enables this feature
    return false;
  } catch (error) {
    console.error('Error checking feature flag:', error);
    return true; // Default to enabled on error
  }
};

/**
 * Track a conversion event for a user in a test
 */
export const trackTestConversion = async (
  userId: string,
  testId: string,
  eventType: string,
  value?: any
): Promise<boolean> => {
  try {
    const assignment = await getUserTestAssignment(userId, testId);
    if (!assignment) {
      return false;
    }

    const event = {
      eventType,
      timestamp: new Date().toISOString(),
      value
    };

    if (USE_MOCK_AB_TESTING) {
      // Update in-memory assignment
      const index = mockAssignments.findIndex(
        a => a.userId === userId && a.testId === testId
      );
      
      if (index !== -1) {
        mockAssignments[index].hasInteracted = true;
        mockAssignments[index].conversionEvents.push(event);
      }
      
      // Update localStorage
      try {
        const storedAssignments = JSON.parse(localStorage.getItem(LS_USER_ASSIGNMENTS) || '[]');
        const assignmentIndex = storedAssignments.findIndex(
          (a: UserTestAssignment) => a.userId === userId && a.testId === testId
        );
        
        if (assignmentIndex !== -1) {
          storedAssignments[assignmentIndex].hasInteracted = true;
          storedAssignments[assignmentIndex].conversionEvents.push(event);
          localStorage.setItem(LS_USER_ASSIGNMENTS, JSON.stringify(storedAssignments));
        }
      } catch (e) {
        console.error('Error updating test assignment in localStorage:', e);
      }
      
      // Track the event in analytics
      trackEvent('test_conversion', {
        testId,
        eventType,
        value
      });
      
      return true;
    }

    // TODO: Implement Firestore version when ready
    return true;
  } catch (error) {
    console.error('Error tracking test conversion:', error);
    return false;
  }
};

/**
 * End an A/B test and declare a winner
 */
export const endABTest = async (
  testId: string,
  winningVariantId?: string
): Promise<boolean> => {
  try {
    const test = await getABTestById(testId);
    if (!test) {
      return false;
    }

    if (USE_MOCK_AB_TESTING) {
      const index = mockTests.findIndex(t => t.id === testId);
      if (index === -1) {
        return false;
      }
      
      mockTests[index].isActive = false;
      mockTests[index].endDate = new Date().toISOString();
      
      if (winningVariantId) {
        mockTests[index].winner = winningVariantId;
      }
      
      return true;
    }

    // TODO: Implement Firestore version when ready
    return true;
  } catch (error) {
    console.error('Error ending A/B test:', error);
    return false;
  }
};

/**
 * Get test results for analysis
 */
export const getTestResults = async (testId: string): Promise<Record<string, any> | null> => {
  try {
    const test = await getABTestById(testId);
    if (!test) {
      return null;
    }

    if (USE_MOCK_AB_TESTING) {
      // Get all assignments for this test
      const allAssignments = mockAssignments.filter(a => a.testId === testId);
      
      // Also check localStorage
      try {
        const storedAssignments = JSON.parse(localStorage.getItem(LS_USER_ASSIGNMENTS) || '[]');
        const localStorageAssignments = storedAssignments.filter(
          (a: UserTestAssignment) => a.testId === testId
        );
        
        // Merge, preferring in-memory assignments
        const assignmentMap = new Map<string, UserTestAssignment>();
        
        [...allAssignments, ...localStorageAssignments].forEach(assignment => {
          assignmentMap.set(assignment.userId, assignment);
        });
        
        const mergedAssignments = Array.from(assignmentMap.values());
        
        // Calculate metrics by variant
        const results: Record<string, any> = {
          testId,
          testName: test.name,
          startDate: test.startDate,
          endDate: test.endDate || null,
          isActive: test.isActive,
          variants: {}
        };
        
        // Initialize variant results
        test.variants.forEach(variant => {
          results.variants[variant.id] = {
            id: variant.id,
            name: variant.name,
            isControl: variant.controlGroup,
            userCount: variant.userCount,
            interactionCount: 0,
            conversionRate: 0,
            events: {}
          };
        });
        
        // Calculate metrics
        mergedAssignments.forEach(assignment => {
          const variantId = assignment.variantId;
          
          if (results.variants[variantId]) {
            if (assignment.hasInteracted) {
              results.variants[variantId].interactionCount++;
            }
            
            // Count events by type
            assignment.conversionEvents.forEach(event => {
              if (!results.variants[variantId].events[event.eventType]) {
                results.variants[variantId].events[event.eventType] = 0;
              }
              
              results.variants[variantId].events[event.eventType]++;
            });
          }
        });
        
        // Calculate conversion rates
        Object.keys(results.variants).forEach(variantId => {
          const variant = results.variants[variantId];
          variant.conversionRate = variant.userCount > 0 
            ? (variant.interactionCount / variant.userCount) * 100 
            : 0;
        });
        
        return results;
      } catch (e) {
        console.error('Error calculating test results:', e);
        return null;
      }
    }

    // TODO: Implement Firestore version when ready
    return null;
  } catch (error) {
    console.error('Error getting test results:', error);
    return null;
  }
};

/**
 * Clear test data (for testing/development)
 */
export const clearABTestData = (): void => {
  if (!USE_MOCK_AB_TESTING) {
    console.warn('This function is only available in mock A/B testing mode');
    return;
  }
  
  mockTests = [];
  mockAssignments = [];
  localStorage.removeItem(LS_USER_ASSIGNMENTS);
};