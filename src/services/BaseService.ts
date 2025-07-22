import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export abstract class BaseService<T> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected getCollection() {
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  public async create(data: Omit<T, 'id'>): Promise<string> {
    try {
      const processedData = this.prepareDataForFirestore(data);
      const docRef = await addDoc(this.getCollection(), processedData);
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create document: ${error}`);
    }
  }

  public async createWithId(id: string, data: Omit<T, 'id'>): Promise<void> {
    try {
      const processedData = this.prepareDataForFirestore(data);
      const docRef = this.getDocRef(id);
      await setDoc(docRef, processedData);
    } catch (error) {
      throw new Error(`Failed to create document with ID: ${error}`);
    }
  }

  public async getById(id: string): Promise<T | null> {
    try {
      const docRef = this.getDocRef(id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.fromFirestore(id, docSnap.data());
      }
      
      return null;
    } catch (error) {
      throw new Error(`Failed to get document by ID: ${error}`);
    }
  }

  public async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    try {
      const docRef = this.getDocRef(id);
      const processedData = this.prepareDataForFirestore(data);
      await updateDoc(docRef, processedData);
    } catch (error) {
      throw new Error(`Failed to update document: ${error}`);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const docRef = this.getDocRef(id);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error(`Failed to delete document: ${error}`);
    }
  }

  public async getAll(constraints?: QueryConstraint[]): Promise<T[]> {
    try {
      const collectionRef = this.getCollection();
      let q = query(collectionRef);

      if (constraints && constraints.length > 0) {
        q = query(collectionRef, ...constraints);
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.fromFirestore(doc.id, doc.data()));
    } catch (error) {
      throw new Error(`Failed to get all documents: ${error}`);
    }
  }

  public async getByField(
    fieldName: string, 
    value: any, 
    constraints?: QueryConstraint[]
  ): Promise<T[]> {
    try {
      const collectionRef = this.getCollection();
      const baseConstraints = [where(fieldName, '==', value)];
      const allConstraints = constraints ? [...baseConstraints, ...constraints] : baseConstraints;
      
      const q = query(collectionRef, ...allConstraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => this.fromFirestore(doc.id, doc.data()));
    } catch (error) {
      throw new Error(`Failed to get documents by field: ${error}`);
    }
  }

  public async paginate(
    pageSize: number,
    lastDoc?: DocumentSnapshot,
    constraints?: QueryConstraint[]
  ): Promise<{ documents: T[]; lastDoc: DocumentSnapshot | null }> {
    try {
      const collectionRef = this.getCollection();
      let queryConstraints = constraints || [];
      
      queryConstraints.push(limit(pageSize));
      
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      const documents = querySnapshot.docs.map(doc => this.fromFirestore(doc.id, doc.data()));
      const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return {
        documents,
        lastDoc: lastDocument
      };
    } catch (error) {
      throw new Error(`Failed to paginate documents: ${error}`);
    }
  }

  public async exists(id: string): Promise<boolean> {
    try {
      const docRef = this.getDocRef(id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      throw new Error(`Failed to check document existence: ${error}`);
    }
  }

  protected prepareDataForFirestore(data: any): any {
    const prepared = { ...data };
    
    if (prepared.createdAt instanceof Date) {
      prepared.createdAt = Timestamp.fromDate(prepared.createdAt);
    }
    
    if (prepared.updatedAt instanceof Date) {
      prepared.updatedAt = Timestamp.fromDate(prepared.updatedAt);
    }

    if (prepared.expiresAt instanceof Date) {
      prepared.expiresAt = Timestamp.fromDate(prepared.expiresAt);
    }

    return prepared;
  }

  protected abstract fromFirestore(id: string, data: any): T;
}