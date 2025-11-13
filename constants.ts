import { Case, Difficulty, Department } from './types';

export const CASES_DATA: Case[] = [
  {
    id: '001',
    title: 'Challenge: User Profile Avatar Upload Fails',
    difficulty: Difficulty.Medium,
    department: Department.UI,
    description: 'Users are reporting an intermittent failure when attempting to upload a new profile picture on Safari.',
    symptoms: 'When a user navigates to their profile page and attempts to upload a new avatar (JPG or PNG), the upload spinner runs indefinitely. The expected success message never appears, and the avatar does not update. The issue seems to occur primarily on Safari browsers.',
    artifacts: [
      {
        type: 'log',
        title: 'Console Error Log',
        content: `[INFO] User 742 initiated avatar upload.
[INFO] File received: avatar_new.jpg (1.2 MB)
[ERROR] Image processing failed for request id: 8a7b-c9df.
TypeError: Cannot read properties of null (reading 'toBlob') at ImageProcessor.js:112`
      },
      {
        type: 'api',
        title: 'API Gateway Response',
        content: JSON.stringify({
            "error": "Failed to process image",
            "message": "Internal server error during image conversion.",
            "requestId": "8a7b-c9df"
          }, null, 2)
      },
      {
          type: 'note',
          title: 'Developer Note',
          content: 'The front-end uses the HTML Canvas API to resize images client-side before uploading to save bandwidth. This logic is in `ImageProcessor.js`.'
      }
    ],
    solution: {
      rootCause: 'The front-end image processing library is using a canvas method (`toBlob`) that is not fully supported or behaves differently in the tested version of Safari. This leads to a null reference before the image can be converted to a blob for uploading.',
      reproSteps: `1. Log in as any user on Safari 15+.
2. Navigate to the user profile page.
3. Click 'Upload New Avatar'.
4. Select a valid JPG or PNG file.`,
      expectedVsActual: `Expected: The new avatar should be displayed, and a "Profile updated" success message should appear.
Actual: The loading spinner continues indefinitely, and the avatar is not updated. A TypeError is visible in the developer console.`,
      severity: 'Medium - Affects a core user feature, but has a browser-specific scope.',
      affectedComponents: ['UserProfile', 'ImageUploadService', 'FrontendImageProcessor.js'],
      testCases: [
          'Verify successful avatar upload on latest Chrome.',
          'Verify successful avatar upload on latest Firefox.',
          'Verify successful avatar upload on latest Safari (after fix).',
          'Verify a user-friendly error message is shown for non-image file uploads.',
          'Verify file size limits are enforced client-side.'
      ]
    },
  },
  {
    id: '002',
    title: 'Challenge: Checkout Button Unresponsive',
    difficulty: Difficulty.Hard,
    department: Department.API,
    description: 'The "Complete Purchase" button in the checkout flow is disabled for some users, blocking them from finishing their orders.',
    symptoms: 'After filling out all shipping and payment information, the "Complete Purchase" button remains in a disabled state. No network requests are fired upon clicking. This behavior is inconsistent and has been reported by users with items in their cart that have complex product variations (e.g., size, color, and personalization).',
     artifacts: [
      {
        type: 'log',
        title: 'Frontend State Log',
        content: `[INFO] User 1138 entered checkout flow.
[INFO] Cart validated successfully. Cart ID: cart-a1b2
[WARN] State update for 'isCheckoutReady' did not trigger component re-render. Previous state: false, New state: false.
[DEBUG] Cart items: [{id: 'prod-xyz', variant: 'L-Blue-Custom'}, {id: 'prod-abc'}]`
      },
      {
        type: 'api',
        title: '/validateCart API Response',
        content: JSON.stringify({
            "cartId": "cart-a1b2",
            "isReadyForCheckout": false,
            "validationErrors": [
              "Variant for product prod-xyz is not fully resolved."
            ]
          }, null, 2)
      },
      {
          type: 'sql',
          title: 'Cart Items Table Snippet',
          content: `| item_id | product_id | variation_details                       |
|---------|------------|-----------------------------------------|
| 1       | prod-xyz   | {"size":"L", "color":"Blue", "text":"_"} |
| 2       | prod-abc   | null                                    |`
      }
    ],
    solution: {
      rootCause: 'The backend `/validateCart` API service is failing to correctly parse and validate cart items that have complex, nested product variant objects. It returns `isReadyForCheckout: false` incorrectly, which the frontend uses to disable the purchase button.',
      reproSteps: `1. Add a standard product to the cart.
2. Add a product with multiple custom variations (e.g., size L, color Blue, custom text).
3. Proceed to the checkout page.
4. Fill in all required fields.`,
      expectedVsActual: `Expected: The 'Complete Purchase' button should become enabled once all fields are valid.
Actual: The 'Complete Purchase' button remains disabled.`,
      severity: 'Critical - Directly blocks revenue generation.',
      affectedComponents: ['CheckoutFlow (UI)', 'StateManagement (Frontend)', 'CartValidationService (Backend)'],
      testCases: [
          'Verify checkout is successful with a single, simple item.',
          'Verify checkout is successful with multiple, simple items.',
          'Verify checkout is successful with a complex, multi-variant item.',
          'Verify checkout is successful with a mix of simple and complex items.',
          'Verify checkout button remains disabled if shipping info is incomplete.'
      ]
    },
  },
  {
    id: '003',
    title: 'Challenge: Dashboard Widgets Load Slowly',
    difficulty: Difficulty.Easy,
    department: Department.Data,
    description: 'The main user dashboard experiences significant delays (5-10 seconds) before all data widgets are fully rendered.',
    symptoms: 'Upon logging in, users are presented with a dashboard containing multiple data widgets (e.g., "Recent Activity", "Performance Metrics"). Each widget shows a loading skeleton for an extended period. Network analysis shows multiple, sequential API calls instead of parallel requests.',
     artifacts: [
      {
        type: 'log',
        title: 'Performance Log',
        content: `[INFO] User 901 authenticated. Loading dashboard...
[PERF] Fetching data for RecentActivityWidget... (Completed in 2.1s)
[PERF] Fetching data for PerformanceMetricsWidget... (Completed in 3.5s)
[PERF] Fetching data for NotificationsWidget... (Completed in 1.8s)
[PERF] Dashboard fully rendered in 7.4s`
      },
      {
        type: 'sql',
        title: 'Slow Database Query',
        content: `EXPLAIN ANALYZE SELECT * 
FROM performance_metrics 
WHERE user_id = '901' AND period = '30d';

--- QUERY PLAN ---
Seq Scan on performance_metrics (cost=0.00..5678.9) (actual time=1.23..3450.6)
  Filter: (user_id = '901' AND period = '30d')
  Rows Removed by Filter: 999,123`
      },
       {
          type: 'note',
          title: 'Frontend Code Snippet',
          content: `async function loadDashboard() {
  const activity = await fetchActivity();
  const metrics = await fetchMetrics();
  const notifications = await fetchNotifications();
  // ... render components
}`
      }
    ],
    solution: {
      rootCause: 'The performance issue has two causes: 1) The frontend dashboard fetches data for each widget sequentially (one after another) instead of in parallel. 2) The database query for `performance_metrics` is missing an index on `user_id`, causing a slow full table scan.',
      reproSteps: `1. Log in as a user with a large amount of historical data.
2. Navigate to the main dashboard.
3. Open the browser's Network tab.`,
      expectedVsActual: `Expected: The dashboard should load all widgets in under 2 seconds. Network requests should be initiated in parallel.
Actual: Dashboard takes over 7 seconds to load. Network tab shows a "waterfall" of requests, each waiting for the previous one to finish.`,
      severity: 'High - Negatively impacts user experience for all active users.',
      affectedComponents: ['DashboardView (Frontend)', 'ApiDataFetcher (Frontend)', 'Database (performance_metrics table)'],
      testCases: [
          'Verify dashboard load time is under 2s for a high-traffic user.',
          'Verify dashboard load time is acceptable for a new user with no data.',
          'Confirm network requests for widgets fire in parallel.',
          'Confirm database query plan for performance_metrics uses a new index.'
      ]
    },
  },
  {
    id: '004',
    title: 'Mobile: Login Keyboard Overlays Input',
    difficulty: Difficulty.Easy,
    department: Department.Mobile,
    description: 'On mobile web browsers, the on-screen keyboard covers the password input field, preventing users from seeing what they are typing.',
    symptoms: 'When a user on a mobile device (iOS Safari or Android Chrome) navigates to the login page and taps on the email field, everything works as expected. However, when they tap on the password field, the keyboard slides up and completely obscures the input. The user cannot see the text they are entering.',
    artifacts: [
      {
        type: 'ui',
        title: 'User Screenshot',
        content: 'Description: A screenshot from an iPhone showing the login screen. The keyboard is visible, and its top edge is covering the password field. The email field above it is still visible.'
      },
      {
        type: 'log',
        title: 'CSS for Form Container',
        content: `.login-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background-color: white;
}`
      },
      {
        type: 'note',
        title: 'Viewport Meta Tag',
        content: '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">'
      }
    ],
    solution: {
      rootCause: "The login form's container is using `position: fixed` and `bottom: 0`, which pins it to the bottom of the viewport. When the mobile keyboard appears, it shrinks the visual viewport's height, but the fixed container does not automatically adjust its position relative to the new visible area, causing the overlap.",
      reproSteps: `1. Open the application's login page on a mobile device or in a browser's mobile device emulator.
2. Tap the email input field (observe normal behavior).
3. Tap the password input field.`,
      expectedVsActual: 'Expected: The page content should scroll up, keeping the active password input field visible above the keyboard.\nActual: The keyboard appears and covers the password input field, making it impossible to see the typed text.',
      severity: 'High - Blocks login for a significant portion of users.',
      affectedComponents: ['Login Page (CSS)', 'Global Stylesheet'],
      testCases: [
        'Verify password field is visible when focused on iOS Safari.',
        'Verify password field is visible when focused on Android Chrome.',
        'Verify form fields on the registration page do not get covered by the keyboard.',
        'Verify rotating the device from portrait to landscape does not break the input visibility.'
      ]
    }
  },
  {
    id: '005',
    title: 'Billing: Duplicate Transactions on Double-Tap',
    difficulty: Difficulty.Medium,
    department: Department.Billing,
    description: 'Users on slow network connections are sometimes charged twice when they tap the "Pay Now" button multiple times.',
    symptoms: 'A user attempts to complete a purchase. Due to a slow network, the confirmation screen does not appear immediately. The user taps the "Pay Now" button again. A few moments later, they receive two payment confirmation emails and see two identical charges on their credit card statement for the same order.',
    artifacts: [
      {
        type: 'log',
        title: 'Frontend Action Log',
        content: `14:02:10.112 - ACTION: @payment/SUBMIT_PAYMENT_REQUESTED
14:02:10.534 - ACTION: @payment/SUBMIT_PAYMENT_REQUESTED
14:02:11.801 - ACTION: @payment/SUBMIT_PAYMENT_SUCCESS
14:02:12.250 - ACTION: @payment/SUBMIT_PAYMENT_SUCCESS`
      },
      {
        type: 'api',
        title: 'Server Request Log Snippet',
        content: `[2023-10-27T14:02:11Z] POST /api/v1/payments { orderId: 'ord-123', amount: 49.99, ... } -> 201 CREATED
[2023-10-27T14:02:12Z] POST /api/v1/payments { orderId: 'ord-123', amount: 49.99, ... } -> 201 CREATED`
      },
      {
        type: 'sql',
        title: 'Transactions Table',
        content: `| transaction_id | order_id | amount | status    | created_at          |
|----------------|----------|--------|-----------|---------------------|
| txn_abc        | ord-123  | 49.99  | COMPLETED | 2023-10-27 14:02:11 |
| txn_def        | ord-123  | 49.99  | COMPLETED | 2023-10-27 14:02:12 |`
      }
    ],
    solution: {
      rootCause: "The frontend does not disable the 'Pay Now' button after the initial click, allowing multiple payment requests to be sent before the first one completes. Additionally, the backend payment processing endpoint is not idempotent, meaning it processes each identical request as a new, unique transaction.",
      reproSteps: `1. Use browser developer tools to throttle the network connection to "Slow 3G".
2. Proceed to the final checkout page with an item in the cart.
3. Click the "Pay Now" button two or three times in quick succession.
4. Wait for the requests to complete and check transaction records.`,
      expectedVsActual: "Expected: Only one payment transaction should be created, regardless of how many times the button is clicked.\nActual: Multiple payment transactions are created for the same order, resulting in duplicate charges.",
      severity: 'Critical - Causes direct financial harm to customers and operational overhead for refunds.',
      affectedComponents: ['CheckoutButton (UI)', 'PaymentSubmission (State)', 'PaymentProcessingService (API)'],
      testCases: [
        "Verify 'Pay Now' button becomes disabled and shows a loading state after one click.",
        'Verify that if two identical payment requests are sent, only one transaction is processed (backend idempotency test).',
        'Verify a successful single-tap payment on a fast connection.',
        'Verify a user-friendly error is shown if the payment fails for other reasons (e.g., declined card).'
      ]
    }
  },
  {
    id: '006',
    title: 'Healthcare: Claim Status Not Updating',
    difficulty: Difficulty.Hard,
    department: Department.Healthcare,
    description: "A patient's insurance claim status remains 'Pending' in the portal, even though the backend provider system shows it as 'Approved'.",
    symptoms: "A claim was submitted five days ago. The insurance provider's internal system correctly updated the claim's status to 'Approved' 24 hours ago. However, in the patient-facing web portal, the same claim still shows a status of 'Pending Review'. The data appears to be out of sync between the source system and the user-facing application.",
    artifacts: [
      {
        type: 'sql',
        title: 'Provider System DB vs. Portal DB',
        content: `--- Provider Claims DB ---
SELECT status FROM provider_claims WHERE claim_id = 'clm-xyz';
-- Result: 'APPROVED'

--- Portal Claims DB ---
SELECT status FROM portal_claim_cache WHERE claim_id = 'clm-xyz';
-- Result: 'PENDING_REVIEW'`
      },
      {
        type: 'log',
        title: 'Data Sync Service Worker Log',
        content: `[2023-10-27T08:00:15Z] [INFO] Starting hourly claim status sync job.
[2023-10-27T08:01:05Z] [INFO] Fetched 5,432 updated claims from provider API.
[2023-10-27T08:01:20Z] [ERROR] Job failed. Cannot process message for claim 'clm-xyz'. UnparseableDateException: '2023/10/26 14:30:05'`
      },
      {
        type: 'api',
        title: 'Provider API Response Snippet (claim clm-xyz)',
        content: JSON.stringify({
          claimId: 'clm-xyz',
          status: 'APPROVED',
          last_updated: '2023/10/26 14:30:05', // Note the date format
          amount: 500.00
        }, null, 2)
      }
    ],
    solution: {
      rootCause: "The external provider's API has changed the date format for the `last_updated` field (from ISO 8601 to `YYYY/MM/DD`). The data synchronization service is not configured to parse this new date format, causing a fatal `UnparseableDateException` when it tries to process the record. This error stops the entire sync job, so no subsequent claims (including the one in question) get updated in the portal's database.",
      reproSteps: `1. Identify the data sync job responsible for updating claim statuses.
2. Examine the logs for this job for the last 24 hours.
3. Inspect the raw API response from the provider for a recently updated claim.
4. Compare the date format in the response to the format expected by the sync service's parser.`,
      expectedVsActual: "Expected: The sync service should successfully parse all incoming data and update the portal database with the 'Approved' status.\nActual: The sync job fails due to an unhandled date format, and the claim status in the portal remains stale.",
      severity: 'High - Provides incorrect and critical information to patients, leading to confusion and support calls.',
      affectedComponents: ['ClaimDataSyncService', 'ProviderApiConnector', 'PortalClaimCache (DB)'],
      testCases: [
        'Verify the sync service correctly handles the new date format `YYYY/MM/DD HH:mm:ss`.',
        'Verify the sync service is resilient and will skip a single malformed record instead of halting the entire job.',
        'Verify claim status updates in the portal within 1 hour of being updated in the provider system.',
        'Verify that if the provider API is down, the portal displays the last known status with a "last updated" timestamp.'
      ]
    }
  },
  {
    id: '007',
    title: 'Auth: Users Logged Out After 5 Minutes',
    difficulty: Difficulty.Medium,
    department: Department.Auth,
    description: 'Users are being logged out of the application after only five minutes of inactivity, disrupting their workflow.',
    symptoms: 'A user logs into the application, navigates to a complex page, and begins reading. Without any interaction with the page for a few minutes, they then click a link to navigate to another section. Instead of seeing the new page, they are redirected to the login screen, having lost their session.',
    artifacts: [
      {
        type: 'api',
        title: 'JWT Payload Snippet',
        content: `// Decoded JSON Web Token from browser storage
{
  "user_id": "usr_123",
  "email": "test@example.com",
  "iat": 1698364800, // Issued At: 2023-10-27 00:00:00 UTC
  "exp": 1698365100  // Expires At: 2023-10-27 00:05:00 UTC
}`
      },
      {
        type: 'log',
        title: 'API Gateway Log',
        content: "[401] UNAUTHORIZED - Token expired. Request from user 'usr_123' to GET /api/v2/dashboard. Expiration: 1698365100, Current Time: 1698365105."
      },
      {
        type: 'note',
        title: 'Server Config File (auth.yml)',
        content: `jwt:
  secret: "env(JWT_SECRET)"
  expiration_minutes: 5`
      }
    ],
    solution: {
      rootCause: 'The JSON Web Token (JWT) expiration is explicitly configured on the backend authentication service to be only 5 minutes. When the frontend makes an API call after this period, the gateway correctly identifies the token as expired and returns a 401 Unauthorized response, which the frontend interprets as a logout event.',
      reproSteps: `1. Log into the application.
2. Note the current time.
3. Do not interact with the application in any way for 6 minutes.
4. Attempt to navigate to a new page or perform an action that requires an API call.`,
      expectedVsActual: "Expected: The user's session should persist for a reasonable duration (e.g., 60 minutes or more), and they should be able to continue using the app.\nActual: The user is logged out and redirected to the login page.",
      severity: 'High - Creates a very poor user experience and can lead to data loss if users are in the middle of a form.',
      affectedComponents: ['AuthenticationService (Backend)', 'ApiGateway (Backend)', 'GlobalAxiosInterceptor (Frontend)'],
      testCases: [
        'Verify session remains active after 30 minutes of inactivity (after fix).',
        'Verify that logging out explicitly invalidates the session.',
        'Verify that a "Session Expiring Soon" warning appears before automatic logout.',
        'Verify that opening the app in a new tab does not invalidate the session in the first tab.'
      ]
    }
  },
  {
    id: '008',
    title: 'Race Condition: Address Edits Lost in Multi-Tab Use',
    difficulty: Difficulty.Hard,
    department: Department.RaceCondition,
    description: 'When a user has their profile open in two tabs, changes made in the first tab are overwritten by changes made in the second tab.',
    symptoms: 'A user opens their "Edit Profile" page in Tab A and Tab B. They update their Phone Number in Tab A and click save. They then switch to Tab B, update their Shipping Address, and click save. The Phone Number reverts back to its old value, but the Shipping Address is updated correctly.',
    artifacts: [
      {
        type: 'api',
        title: 'API PUT Request from Tab A',
        content: `PUT /api/user/profile
{
  "name": "Jane Doe",
  "phone": "555-123-4567", // <-- New value
  "shippingAddress": "123 Main St"
}`
      },
      {
        type: 'api',
        title: 'API PUT Request from Tab B',
        content: `PUT /api/user/profile
{
  "name": "Jane Doe",
  "phone": "555-000-0000", // <-- Old, stale value
  "shippingAddress": "456 Oak Ave" // <-- New value
}`
      },
      {
        type: 'note',
        title: 'Frontend State Logic',
        content: `// On page load, we fetch the full user profile and store it.
const [profile, setProfile] = useState(null);
useEffect(() => { fetchUserProfile().then(setProfile) }, []);

// On save, we send the entire profile object back.
const handleSave = () => {
  updateUserProfile(profile);
}`
      }
    ],
    solution: {
      rootCause: "A classic race condition. The application uses a `PUT` request that replaces the entire user profile object. Both tabs load the same initial state. When Tab A saves, it sends the whole object with the updated phone number. When Tab B saves, it sends *its* version of the whole object, which has the new address but the *old* phone number it loaded initially, thus overwriting the change from Tab A.",
      reproSteps: `1. Log in and navigate to the "Edit Profile" page.
2. Open the same "Edit Profile" page in a second browser tab.
3. In the first tab, change the phone number and save.
4. In the second tab, change the shipping address and save.
5. Refresh the first tab and observe that the phone number has reverted to its original value.`,
      expectedVsActual: "Expected: Both the phone number and shipping address updates should be saved correctly, reflecting both changes.\nActual: The second save operation overwrites the data from the first, causing data loss.",
      severity: 'Medium - Can cause frustrating data loss, but requires an unusual user workflow.',
      affectedComponents: ['ProfileEditPage (Frontend)', 'UserProfileService (API)'],
      testCases: [
        'Verify that updating one field does not affect other fields when using multiple tabs.',
        'Verify that a `PATCH` request is used to send only the changed fields, not the entire object.',
        "Verify optimistic locking is implemented (e.g., using ETags or a version number) to prevent overwriting more recent data.",
        'Verify normal, single-tab profile editing works as expected.'
      ]
    }
  },
  {
    id: '009',
    title: 'Performance: Report Download Takes 90s on Firefox',
    difficulty: Difficulty.Medium,
    department: Department.Performance,
    description: 'Generating and downloading a large CSV report causes the browser to hang for over a minute, especially on Firefox.',
    symptoms: 'A user in the admin panel clicks "Download Full Report". The API call to fetch the report data completes quickly (under 3 seconds), but the browser UI freezes and becomes completely unresponsive for a long time afterward. The download eventually starts, but the user experience is very poor. The issue is significantly more pronounced on Firefox than on Chrome.',
    artifacts: [
      {
        type: 'network',
        title: 'Network Tab Analysis',
        content: `Request: GET /api/reports/full-data
Status: 200 OK
Time: 2.8s
Size: 15.2 MB
---
Browser UI becomes unresponsive for ~88 seconds after this request finishes.`
      },
      {
        type: 'log',
        title: 'Browser Performance Profile',
        content: 'Flame graph shows a single long task taking 88,000ms. The function responsible is `generateCSVString` which contains a synchronous `for` loop iterating over 200,000 records.'
      },
      {
        type: 'note',
        title: 'Code Snippet from reportGenerator.js',
        content: `function generateAndDownload(jsonData) {
  let csv = 'ID,Name,Date,Amount\\n'; // header row
  // This loop blocks the main thread
  for (const item of jsonData) {
    csv += \`\${item.id},\${item.name},\${item.date},\${item.amount}\\n\`;
  }
  
  // Trigger download...
}`
      }
    ],
    solution: {
      rootCause: "The client-side JavaScript code is synchronously processing a very large JSON dataset (200,000+ records) on the browser's main thread to generate a CSV string. This long-running, blocking operation freezes the UI until it completes. Different browser JavaScript engines have varying performance, explaining why it's worse on Firefox.",
      reproSteps: `1. Log into the admin panel as a user with access to a large dataset.
2. Open the browser's developer tools to the Performance tab.
3. Click "Download Full Report" and start a performance profile.
4. Observe the long task that blocks the main thread after the data has been fetched.`,
      expectedVsActual: "Expected: The UI should remain responsive while the report is being prepared, possibly showing a progress indicator. The download should start promptly.\nActual: The entire browser tab freezes for over a minute, creating the impression that the application has crashed.",
      severity: 'High - Makes a core feature unusable and appears as a major application failure.',
      affectedComponents: ['ReportGenerator (Frontend)', 'AdminDashboard (UI)'],
      testCases: [
        'Verify UI remains responsive during large report generation (after moving logic to a Web Worker).',
        'Verify the downloaded CSV contains all the correct data.',
        'Verify a loading indicator is shown to the user during the CSV generation process.',
        'Verify downloading a small report (e.g., < 1000 rows) is still fast and does not freeze the UI.'
      ]
    }
  },
  {
    id: '010',
    title: 'Security: Password Reset Email Enumeration',
    difficulty: Difficulty.Easy,
    department: Department.Security,
    description: "The 'Forgot Password' page reveals whether an email address is registered with the system, allowing for account enumeration.",
    symptoms: "On the password reset page, if a user enters an email address that exists in the database, they receive the message 'Password reset link sent.' If they enter an email address that does *not* exist, they receive a different message: 'No account found with that email address.' This allows an attacker to discover valid user emails.",
    artifacts: [
      {
        type: 'ui',
        title: 'Response for Registered Email',
        content: 'A screenshot showing the form with the message: "Password reset link sent to test@example.com."'
      },
      {
        type: 'ui',
        title: 'Response for Unregistered Email',
        content: 'A screenshot showing the form with the error message: "No account found with that email address."'
      },
      {
        type: 'api',
        title: 'API Responses',
        content: `// Request for 'registered@example.com'
{ "status": "success", "message": "Email sent." }

// Request for 'unregistered@example.com'
{ "status": "error", "message": "User not found." }`
      }
    ],
    solution: {
      rootCause: 'The backend API provides distinct responses based on whether the email exists in the user database. The frontend then displays these different messages to the user. This is a common information disclosure vulnerability known as user enumeration.',
      reproSteps: `1. Navigate to the "Forgot Password" page.
2. Enter an email address known to be registered. Observe the success message.
3. Enter an email address known to be unregistered (e.g., a random string). Observe the error message.
4. The difference in response confirms the vulnerability.`,
      expectedVsActual: "Expected: The application should return a generic, non-committal message for both registered and unregistered emails to prevent information leakage.\nActual: The application explicitly confirms the existence or non-existence of an account for the given email.",
      severity: 'Medium - Does not directly compromise accounts but provides valuable information for attackers.',
      affectedComponents: ['PasswordReset (API)', 'ForgotPassword (UI)'],
      testCases: [
        "Verify the same generic message ('If an account with that email exists, a reset link has been sent.') is shown for both registered and unregistered emails.",
        'Verify a registered user correctly receives a password reset email.',
        'Verify an unregistered email address does not trigger any email to be sent.',
        'Verify response times are similar for both valid and invalid requests to prevent timing attacks.'
      ]
    }
  },
  {
    id: '011',
    title: 'Test Data: Search Results Broken by Test Data Pollution',
    difficulty: Difficulty.Medium,
    department: Department.TestData,
    description: "Production search results are cluttered with irrelevant test entries, making it difficult for real users to find what they're looking for.",
    symptoms: 'When a user searches for a common term like "shirt" on the e-commerce site, the first page of results includes items named "DO NOT USE - Test Shirt", "QA Automation Product - Adam", and "DELETE ME". This test data pushes legitimate products down the page and creates a confusing, unprofessional user experience.',
    artifacts: [
      {
        type: 'ui',
        title: 'Search Results Screenshot',
        content: 'A screenshot of the search results page showing a mix of real products and products with names clearly indicating they are for testing purposes.'
      },
      {
        type: 'sql',
        title: 'Products Table Snippet',
        content: `| product_name                      | is_active | created_by    |
|-----------------------------------|-----------|---------------|
| Classic Blue T-Shirt              | true      | system        |
| QA Automation Product - Adam      | true      | qa_service_acct |
| DELETE ME                         | true      | qa_service_acct |
| Premium Silk Scarf                | true      | system        |`
      },
      {
        type: 'log',
        title: 'E2E Test Runner Log',
        content: `[INFO] Running test suite 'SearchAndCheckout'.
[INFO] Creating prerequisite product data...
[INFO] API CALL: POST /api/products { name: 'QA Automation Product - Adam', ... }
[INFO] Product created successfully.
[PASS] Test 'userCanSearchForProduct' completed.
// No cleanup steps are logged after the test suite finishes.`
      }
    ],
    solution: {
      rootCause: "Automated end-to-end tests are creating data in a production-like environment (e.g., staging) but are not cleaning up the test data after the tests complete. This polluted data is then either being indexed for production search or the staging database is being promoted to production without proper sanitization, leaking test artifacts to real users.",
      reproSteps: `1. Execute the automated E2E test suite against the staging environment.
2. After the tests complete, inspect the \`products\` table in the staging database.
3. Observe that the newly created test products still exist.
4. Perform a search on the production website and find the same test products.`,
      expectedVsActual: "Expected: The production search should only return legitimate, user-facing products. Test data should be isolated and never visible to end users.\nActual: Test data is being indexed and displayed in production search results, degrading the quality of the service.",
      severity: 'High - Directly impacts the core user experience, erodes user trust, and can affect sales.',
      affectedComponents: ['Search Indexer', 'E2E Test Suite', 'DB Sanitization Process'],
      testCases: [
        'Verify that test data created by automation is deleted at the end of the test run.',
        "Verify the production search query explicitly filters out test data (e.g., `WHERE is_test_account = false`).",
        'Verify that the database cloning/sanitization process removes all data created by known test accounts.',
        'Verify that manual testers have a clear process for creating and cleaning up their own test data.'
      ]
    }
  },
  {
    id: '012',
    title: 'Regression: New Notification Banner Breaks Nav Menu',
    difficulty: Difficulty.Easy,
    department: Department.Regression,
    description: "A new site-wide notification banner, added in the latest release, now appears on top of the main navigation's dropdown menu, making it unusable.",
    symptoms: 'When a user clicks on a top-level navigation item like "Products" or "Account", the dropdown menu appears as expected, but it is rendered *underneath* the new promotional banner at the top of the page. This makes the menu items obscured and unclickable.',
    artifacts: [
      {
        type: 'ui',
        title: 'Screenshot of the Issue',
        content: 'A screenshot showing the top of the website. A yellow promotional banner is visible. The "Products" navigation item is active, and its dropdown menu is partially visible but tucked behind the yellow banner.'
      },
      {
        type: 'log',
        title: 'CSS for Notification Banner',
        content: `/* new-banner.css */
.notification-banner {
  position: relative;
  z-index: 1000;
  background-color: #FFD700;
}`
      },
      {
        type: 'log',
        title: 'CSS for Navigation Dropdown',
        content: `/* header.css */
.nav-dropdown {
  position: absolute;
  z-index: 999;
  background-color: #FFFFFF;
  border: 1px solid #CCC;
}`
      }
    ],
    solution: {
      rootCause: "A CSS `z-index` stacking context issue. The newly introduced notification banner was given a `z-index` of 1000, while the existing navigation dropdown menu has a lower `z-index` of 999. In the browser's rendering engine, elements with a higher `z-index` are stacked on top of elements with a lower `z-index`, causing the banner to cover the menu.",
      reproSteps: `1. Navigate to the homepage.
2. Hover over or click on any main navigation item that has a dropdown menu.
3. Observe the dropdown menu appearing behind the notification banner.`,
      expectedVsActual: "Expected: The navigation dropdown menu should appear on top of all other page content, including the new banner, so it is fully visible and clickable.\nActual: The dropdown menu is hidden behind the banner.",
      severity: 'Critical - Blocks access to primary navigation, preventing users from accessing key parts of the application.',
      affectedComponents: ['SiteHeader (CSS)', 'NotificationBanner (CSS)'],
      testCases: [
        'Verify the navigation dropdown appears on top of the notification banner.',
        'Verify the notification banner can still be closed or interacted with.',
        'Verify other absolutely positioned elements (like modals or tooltips) are not affected by the banner.',
        'Check cross-browser compatibility for the z-index fix (Chrome, Firefox, Safari).'
      ]
    }
  }
];