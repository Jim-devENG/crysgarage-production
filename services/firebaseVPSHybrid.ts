// Simple Firebase + VPS Hybrid - Using Your Real Database
// Database: crys-garage on Firebase
import { db } from '../firebase/firestoreDb';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export class FirebaseVPSHybrid {
  private static instance: FirebaseVPSHybrid;
  
  private constructor() {
    console.log('🚀 Firebase + VPS Hybrid initialized with REAL database: crys-garage');
  }

  public static getInstance(): FirebaseVPSHybrid {
    if (!FirebaseVPSHybrid.instance) {
      FirebaseVPSHybrid.instance = new FirebaseVPSHybrid();
    }
    return FirebaseVPSHybrid.instance;
  }

  // Firebase handles user data, VPS handles processing
  async syncUserToFirebase(userData: any): Promise<void> {
    try {
      const userRef = doc(db, 'users', userData.id);
      await setDoc(userRef, {
        ...userData,
        lastSync: new Date().toISOString(),
        source: 'firebase-vps-hybrid',
        database: 'crys-garage'
      }, { merge: true });
      console.log('✅ User synced to Firebase database:', userData.id);
    } catch (error) {
      console.error('❌ Failed to sync user to Firebase:', error);
      throw error;
    }
  }

  // Get user from Firebase
  async getUserFromFirebase(userId: string): Promise<any> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        console.log('✅ User retrieved from Firebase database:', userId);
        return userSnap.data();
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get user from Firebase:', error);
      throw error;
    }
  }

  // Update user credits (VPS updates this after processing)
  async updateUserCredits(userId: string, credits: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        credits: credits,
        lastUpdated: new Date().toISOString()
      });
      console.log('✅ Credits updated in Firebase:', { userId, credits });
    } catch (error) {
      console.error('❌ Failed to update credits:', error);
      throw error;
    }
  }

  // Create processing job (VPS will process it)
  async createProcessingJob(jobData: any): Promise<string> {
    try {
      const jobsRef = collection(db, 'processingJobs');
      const docRef = await addDoc(jobsRef, {
        ...jobData,
        status: 'queued',
        createdAt: new Date().toISOString(),
        vpsProcessing: true,
        database: 'crys-garage'
      });
      console.log('✅ Processing job created in Firebase:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to create processing job:', error);
      throw error;
    }
  }

  // Update job status (VPS calls this)
  async updateJobStatus(jobId: string, status: string, result?: any): Promise<void> {
    try {
      const jobRef = doc(db, 'processingJobs', jobId);
      await updateDoc(jobRef, {
        status: status,
        updatedAt: new Date().toISOString(),
        ...(result && { result })
      });
      console.log('✅ Job status updated:', { jobId, status });
    } catch (error) {
      console.error('❌ Failed to update job status:', error);
      throw error;
    }
  }

  // Get user's jobs from Firebase
  async getUserJobs(userId: string): Promise<any[]> {
    try {
      const jobsRef = collection(db, 'processingJobs');
      const q = query(jobsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ User jobs retrieved:', { userId, count: jobs.length });
      return jobs;
    } catch (error) {
      console.error('❌ Failed to get user jobs:', error);
      throw error;
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const testRef = doc(db, 'test', 'connection');
      await setDoc(testRef, {
        timestamp: new Date().toISOString(),
        status: 'connected',
        database: 'crys-garage',
        test: true
      });
      console.log('✅ Firebase database connection successful!');
      return true;
    } catch (error) {
      console.error('❌ Firebase database connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const firebaseVPSHybrid = FirebaseVPSHybrid.getInstance();
export default firebaseVPSHybrid;

