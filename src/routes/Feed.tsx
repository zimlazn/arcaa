import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { db, storage } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, ImagePlus, X, Loader2 } from 'lucide-react';
import { Post } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

export function Feed() {
  const { couple, currentUser, userProfile, partnerProfile } = useStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  
  useEffect(() => {
    if (!couple) return;
    const q = query(collection(db, `couples/${couple.id}/posts`), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const feed = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
      setPosts(feed);
    });
    return () => unsub();
  }, [couple]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !couple || !currentUser) return;
    try {
      setIsUploading(true);
      const storageRef = ref(storage, `couples/${couple.id}/images/${Date.now()}_${file.name}`);
      const uploadTask = await uploadBytesResumable(storageRef, file);
      const url = await getDownloadURL(uploadTask.ref);

      await addDoc(collection(db, `couples/${couple.id}/posts`), {
        authorId: currentUser.uid,
        imageUrl: url,
        caption: caption.trim(),
        likes: [],
        createdAt: serverTimestamp()
      });
      setShowUpload(false);
      setFile(null);
      setCaption('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleLike = async (postId: string, hasLiked: boolean) => {
    if (!couple || !currentUser) return;
    const postRef = doc(db, `couples/${couple.id}/posts`, postId);
    try {
       await updateDoc(postRef, {
         likes: hasLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
       });
    } catch(err) {
      console.error("Error toggling like", err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-20 md:pb-6 relative">
      <div className="flex items-center justify-between sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl py-4 pt-safe md:pt-4 border-b border-white/5 px-2 md:px-0">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Memories</h2>
        <button 
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-lg shadow-rose-500/20"
        >
          <ImagePlus className="w-5 h-5" />
          <span>Add</span>
        </button>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-2xl mb-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4 text-white">
                <h3 className="font-semibold">New Memory</h3>
                <button onClick={() => setShowUpload(false)}><X className="w-5 h-5 text-white/50" /></button>
              </div>
              <form onSubmit={handleUpload} className="flex flex-col gap-4">
                <label className="block w-full aspect-video rounded-2xl border-2 border-dashed border-white/20 hover:border-rose-400 bg-black/20 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative">
                   {file ? (
                     <img src={URL.createObjectURL(file)} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                   ) : (
                     <div className="flex flex-col items-center text-white/40">
                       <ImagePlus className="w-8 h-8 mb-2" />
                       <span className="text-sm font-medium">Select a photo</span>
                     </div>
                   )}
                   <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
                <input 
                  type="text" 
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Write a sweet caption..." 
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                />
                <button 
                  disabled={!file || isUploading}
                  className="w-full bg-gradient-to-r from-rose-500 to-indigo-500 text-white py-3.5 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post Memory'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {posts.length === 0 && !showUpload && (
          <div className="text-center py-20 text-white/40">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No memories yet. Share your first moment together!</p>
          </div>
        )}
        
        {posts.map((post) => {
          const isMyPost = post.authorId === currentUser?.uid;
          const authorProfile = isMyPost ? userProfile : partnerProfile;
          const hasLiked = currentUser ? (post.likes || []).includes(currentUser.uid) : false;
          
          return (
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={post.id} 
              className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-xl"
            >
              <div className="px-5 py-4 flex items-center gap-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-white/10 shrink-0">
                   {authorProfile?.photoURL && <img src={authorProfile.photoURL} className="w-full h-full object-cover" />}
                </div>
                <div>
                   <h4 className="font-semibold text-white/90 leading-tight">{authorProfile?.displayName || 'Partner'}</h4>
                   <p className="text-xs text-white/40">{post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), {addSuffix: true}) : 'Just now'}</p>
                </div>
              </div>
              
              <div className="relative aspect-square md:aspect-[4/3] bg-black">
                <img src={post.imageUrl} alt={post.caption} className="absolute inset-0 w-full h-full object-cover" />
              </div>

              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                   <button 
                     onClick={() => toggleLike(post.id, hasLiked)}
                     className="flex items-center gap-2 group transition-colors"
                   >
                     <Heart className={cn("w-7 h-7 transition-all active:scale-75", hasLiked ? "fill-rose-500 text-rose-500" : "text-white/80 group-hover:text-rose-400")} />
                   </button>
                </div>
                
                {post.likes?.length > 0 && (
                  <p className="text-sm font-semibold text-white mb-2">{post.likes.length} like{post.likes.length > 1 ? 's' : ''}</p>
                )}
                
                <p className="text-white/90 text-[15px]">
                  <span className="font-semibold mr-2">{authorProfile?.displayName || 'Partner'}</span>
                  {post.caption}
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
