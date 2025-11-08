export interface FileMeta {
	name: string;
	size: number;
	type?: string;
	lastModified?: number;
}

export interface StoredDashboardState {
	currentStep: number;
	selectedFileMeta: FileMeta | null;
	selectedFileKey: string | null;
	selectedGenre: any;
	processedAudioUrl: string | null;
	isProcessing: boolean;
	downloadFormat: 'wav' | 'mp3';
	fileInfo: any;
}

// IndexedDB minimal helpers
const DB_NAME = 'professionalDashboardDB';
const STORE_NAME = 'files';

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = window.indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export async function idbSave(key: string, blob: Blob): Promise<void> {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		store.put(blob, key);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export async function idbLoad(key: string): Promise<Blob | null> {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const store = tx.objectStore(STORE_NAME);
		const req = store.get(key);
		req.onsuccess = () => resolve((req.result as Blob) || null);
		req.onerror = () => reject(req.error);
	});
}

export async function idbDelete(key: string): Promise<void> {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		store.delete(key);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export const loadStateFromStorage = (): StoredDashboardState => {
	try {
		const savedState = sessionStorage.getItem('professionalDashboardState');
		if (savedState) {
			const parsed = JSON.parse(savedState);

			const meta: FileMeta | null = parsed.selectedFileMeta && typeof parsed.selectedFileMeta.name === 'string'
				? {
					name: parsed.selectedFileMeta.name,
					size: typeof parsed.selectedFileMeta.size === 'number' ? parsed.selectedFileMeta.size : 0,
					type: parsed.selectedFileMeta.type || undefined,
					lastModified: parsed.selectedFileMeta.lastModified || undefined
				}
				: null;

			const hasValidMeta = !!(meta && meta.name && typeof meta.size === 'number' && meta.size > 0);

			return {
				currentStep: hasValidMeta ? (parsed.currentStep || 1) : 1,
				selectedFileMeta: hasValidMeta ? meta : null,
				selectedFileKey: hasValidMeta ? (parsed.selectedFileKey || 'selectedFile') : null,
				selectedGenre: parsed.selectedGenre || null,
				processedAudioUrl: parsed.processedAudioUrl || null,
				isProcessing: false,
				downloadFormat: parsed.downloadFormat || 'wav',
				fileInfo: parsed.fileInfo || null
			};
		}
	} catch (error) {
		console.error('Error loading state from storage:', error);
	}
	return {
		currentStep: 1,
		selectedFileMeta: null,
		selectedFileKey: null,
		selectedGenre: null,
		processedAudioUrl: null,
		isProcessing: false,
		downloadFormat: 'wav',
		fileInfo: null
	};
};

export const saveStateToStorage = (state: any) => {
	try {
		let selectedFileMeta: FileMeta | null = null;
		let selectedFileKey: string | null = null;

		if (state.selectedFile instanceof File || (state.selectedFile && state.selectedFile.name && state.selectedFile.size)) {
			const file: File = state.selectedFile;
			selectedFileMeta = {
				name: file.name,
				size: file.size,
				type: file.type,
				lastModified: (file as any).lastModified
			};
			selectedFileKey = 'selectedFile';
		} else if (state.selectedFileMeta) {
			selectedFileMeta = state.selectedFileMeta;
			selectedFileKey = state.selectedFileKey || 'selectedFile';
		}

		const toSave = {
			currentStep: state.currentStep || 1,
			selectedFileMeta,
			selectedFileKey,
			selectedGenre: state.selectedGenre || null,
			processedAudioUrl: state.processedAudioUrl || null,
			isProcessing: !!state.isProcessing,
			downloadFormat: state.downloadFormat || 'wav',
			fileInfo: state.fileInfo || null
		};

		sessionStorage.setItem('professionalDashboardState', JSON.stringify(toSave));
	} catch (error) {
		console.error('Error saving state to storage:', error);
	}
};
