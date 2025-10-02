
import { getAuth } from 'firebase/auth';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public request: {
    auth: any; // Ideally, this would be typed against the request.auth object in rules
    method: SecurityRuleContext['operation'];
    path: string;
    resource?: {
      data: any;
    };
  };

  constructor(context: SecurityRuleContext) {
    const auth = getAuth();
    const user = auth.currentUser;

    let userInfo: any = null;
    if (user) {
      userInfo = {
        uid: user.uid,
        token: {
          name: user.displayName,
          picture: user.photoURL,
          email: user.email,
          email_verified: user.emailVerified,
          phone_number: user.phoneNumber,
          firebase: {
            identities: user.providerData.reduce((acc, provider) => {
              const providerId = provider.providerId;
              if (!acc[providerId]) {
                acc[providerId] = [];
              }
              acc[providerId].push(provider.uid);
              return acc;
            }, {} as Record<string, string[]>),
            sign_in_provider: user.providerData[0]?.providerId || 'custom',
          },
        },
      };
    }

    const requestObject = {
      auth: userInfo,
      method: context.operation,
      path: `/databases/(default)/documents${context.path.startsWith('/') ? '' : '/'}${context.path}`,
      ...(context.requestResourceData && { resource: { data: context.requestResourceData } }),
    };

    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(requestObject, null, 2)}`;

    super(message);
    this.name = 'FirestorePermissionError';
    this.request = requestObject;

    // This is to make sure the error shows up correctly in modern JS environments
    if (typeof (Object as any).setPrototypeOf === 'function') {
      (Object as any).setPrototypeOf(this, FirestorePermissionError.prototype);
    } else {
      (this as any).__proto__ = FirestorePermissionError.prototype;
    }
  }
}
