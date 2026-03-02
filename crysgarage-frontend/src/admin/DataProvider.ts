import { DataProvider } from 'react-admin';
import { stringify } from 'query-string';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvQZ8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8",
  authDomain: "crysgarage-studio.firebaseapp.com",
  projectId: "crysgarage-studio",
  storageBucket: "crysgarage-studio.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnopqrstuv"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const API_URL = 'https://crysgarage.studio';

const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    // Use Firebase for users, API for other resources
    if (resource === 'users') {
      try {
        const collectionRef = collection(db, 'users');
        let q = query(collectionRef);
        
        // Apply filters
        if (params.filter) {
          Object.entries(params.filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              q = query(q, where(key, '==', value));
            }
          });
        }
        
        // Apply sorting
        if (params.sort?.field) {
          q = query(q, orderBy(params.sort.field, params.sort.order?.toLowerCase() as 'asc' | 'desc'));
        }
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        }));
        
        return {
          data,
          total: data.length,
        };
      } catch (error) {
        console.error(`Firebase error fetching ${resource}:`, error);
        throw new Error(`Failed to fetch ${resource}: ${error.message}`);
      }
    }
    
    // For other resources, use API with real-time data
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const queryParams = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify(params.filter),
      realtime: 'true', // Add real-time flag
    };
    const url = `${API_URL}/api/v1/${resource}?${stringify(queryParams)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      data: data,
      total: data.length,
    };
  },

  getOne: async (resource, params) => {
    const response = await fetch(`${API_URL}/${resource}/${params.id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data };
  },

  getMany: async (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${API_URL}/${resource}?${stringify(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: JSON.stringify([field, order]),
      range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };
    const url = `${API_URL}/${resource}?${stringify(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      data: data,
      total: data.length,
    };
  },

  create: async (resource, params) => {
    const response = await fetch(`${API_URL}/${resource}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data };
  },

  update: async (resource, params) => {
    const response = await fetch(`${API_URL}/${resource}/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data };
  },

  updateMany: async (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const response = await fetch(`${API_URL}/${resource}?${stringify(query)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data };
  },

  delete: async (resource, params) => {
    const response = await fetch(`${API_URL}/${resource}/${params.id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: params.previousData };
  },

  deleteMany: async (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const response = await fetch(`${API_URL}/${resource}?${stringify(query)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: params.ids };
  },
};

export { dataProvider };
