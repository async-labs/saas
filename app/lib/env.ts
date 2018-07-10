export default (typeof window !== 'undefined' ? (window as any).__ENV__ : process.env);
