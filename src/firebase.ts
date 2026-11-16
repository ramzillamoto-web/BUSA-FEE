import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot,
  collection,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { PaymentItem, AgreementMeta } from './types';
import { INITIAL_AGREEMENT, INITIAL_PAYMENTS } from './data/initialData';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot per Firebase skill guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'agreements', 'default'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is currently running in offline mode.');
    }
    return false;
  }
}
testConnection();

// Subscribe to global payments collection in real-time
export function subscribeToPayments(
  onUpdate: (payments: PaymentItem[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const paymentsCol = collection(db, 'payments');
  return onSnapshot(
    paymentsCol,
    (snapshot) => {
      if (snapshot.empty) {
        // If empty on remote Firestore, seed initial 6 payments
        seedInitialPayments().catch((e) => console.error('Failed to seed payments:', e));
        return;
      }
      const items: PaymentItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as PaymentItem;
        items.push({
          id: data.id,
          monthNum: data.monthNum,
          dueDate: data.dueDate,
          dueDateISO: data.dueDateISO,
          amount: data.amount,
          method: data.method,
          status: data.status,
          referenceNo: data.referenceNo || '',
          paidAt: data.paidAt || null,
          notes: data.notes || '',
        });
      });
      // Sort numerically by id (1..6)
      items.sort((a, b) => a.id - b.id);
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'payments');
    }
  );
}

// Subscribe to global agreement settings in real-time
export function subscribeToAgreement(
  onUpdate: (agreement: AgreementMeta) => void,
  onError?: (err: unknown) => void
): () => void {
  const agreementDoc = doc(db, 'agreements', 'default');
  return onSnapshot(
    agreementDoc,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as AgreementMeta);
      } else {
        // Seed default agreement
        seedInitialAgreement().catch((e) => console.error('Failed to seed agreement:', e));
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'agreements/default');
    }
  );
}

// Update single payment globally
export async function updatePaymentGlobal(payment: PaymentItem): Promise<void> {
  const paymentPath = `payments/${payment.id}`;
  try {
    const paymentDoc = doc(db, 'payments', String(payment.id));
    await setDoc(paymentDoc, {
      id: payment.id,
      monthNum: payment.monthNum,
      dueDate: payment.dueDate,
      dueDateISO: payment.dueDateISO,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      referenceNo: payment.referenceNo || '',
      paidAt: payment.paidAt || null,
      notes: payment.notes || '',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, paymentPath);
  }
}

// Update agreement metadata globally (e.g., Maya number)
export async function updateAgreementGlobal(agreement: AgreementMeta): Promise<void> {
  const agreementPath = 'agreements/default';
  try {
    const agreementDoc = doc(db, 'agreements', 'default');
    await setDoc(agreementDoc, agreement);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, agreementPath);
  }
}

// Seed initial payments to Firestore
export async function seedInitialPayments(): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const payment of INITIAL_PAYMENTS) {
      const ref = doc(db, 'payments', String(payment.id));
      batch.set(ref, payment);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'payments');
  }
}

// Seed initial agreement to Firestore
export async function seedInitialAgreement(): Promise<void> {
  try {
    const ref = doc(db, 'agreements', 'default');
    await setDoc(ref, INITIAL_AGREEMENT);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'agreements/default');
  }
}

// Reset all global data back to original PDF initial values
export async function resetAllDataGlobal(): Promise<void> {
  await seedInitialAgreement();
  await seedInitialPayments();
}
