import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { initialProducts, initialPosts, initialChats, aiStudyResources } from '../data/mockData';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { currentUser, verifyCurrentStudent } = useAuth();
  const socketRef = useRef(null);

  // Fallback user if not logged in (for demo viewing)
  const defaultGuestUser = {
    id: "guest",
    name: "Guest Student",
    branch: "Engineering",
    year: "1st Year",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    collegeEmail: "guest@college.edu",
    isVerified: false,
    collegeId: "COL-GUEST"
  };

  const user = currentUser || defaultGuestUser;

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('campus_theme');
    return saved === 'dark' ? true : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('campus_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('campus_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const verifyStudent = (email) => {
    const success = verifyCurrentStudent(email);
    if (success) {
      addNotification("Verification Successful!", `Your student email ${email} has been verified.`);
      return true;
    }
    return false;
  };

  // Products state
  const [products, setProducts] = useState(initialProducts);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products from backend:", err);
      // Fallback to local storage or mock data if backend is down
      const saved = localStorage.getItem('campus_products');
      if (saved) {
        setProducts(JSON.parse(saved));
      } else {
        setProducts(initialProducts);
      }
    }
  };

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync products state back to local storage as fallback
  useEffect(() => {
    if (products && products.length > 0 && products !== initialProducts) {
      localStorage.setItem('campus_products', JSON.stringify(products));
    }
  }, [products]);

  // Posts state
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('campus_posts');
    return saved ? JSON.parse(saved) : initialPosts;
  });

  useEffect(() => {
    localStorage.setItem('campus_posts', JSON.stringify(posts));
  }, [posts]);

  // Chats state
  const [chats, setChats] = useState([]);

  const fetchConversations = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(res.data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      // Fallback to local storage
      const saved = localStorage.getItem('campus_chats');
      if (saved) {
        setChats(JSON.parse(saved));
      } else {
        setChats([]);
      }
    }
  };

  // Fetch conversations when current user logs in
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    } else {
      setChats([]);
    }
  }, [currentUser]);

  // Sync chats state back to local storage as fallback
  useEffect(() => {
    if (chats && chats.length > 0) {
      localStorage.setItem('campus_chats', JSON.stringify(chats));
    }
  }, [chats]);

  // WebSockets implementation for real-time delivery
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    let ws = null;
    try {
      // Translate HTTP API URL into WS URL
      const wsHost = API_URL.replace(/^https?:\/\//, '');
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProto}//${wsHost}/api/chat/ws/${token}`;
      
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Sync conversation log in state
          fetchConversations();
          
          // Trigger user alert if they received a message from someone else
          if (data.sender_id !== currentUser.id) {
            addNotification("New Message", data.text);
          }
        } catch (e) {
          console.error("Failed to parse incoming WS text:", e);
        }
      };

      ws.onclose = () => {
        console.log("Chat websocket connection closed.");
      };

    } catch (err) {
      console.error("Websocket initialization failed:", err);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [currentUser]);

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('campus_wishlist');
    return saved ? JSON.parse(saved) : ["p1", "p2"];
  });

  useEffect(() => {
    localStorage.setItem('campus_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: "n1", title: "New listing alert", message: "Aarav Sharma added 'Arduino IoT Starter Kit'", time: "3 hours ago", unread: true },
    { id: "n2", title: "Message received", message: "Priya Patel replied to your inquiry", time: "1 day ago", unread: false }
  ]);

  // UI state
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace', 'community', 'smart-match'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState(2000);
  const [conditionFilter, setConditionFilter] = useState('All');
  
  // Modals & Drawers
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Actions
  const toggleWishlist = (productId) => {
    if (!currentUser) {
      addNotification("Login Required", "Please login or register to save items to your wishlist.");
      return;
    }
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      if (!exists) {
        addNotification("Added to Wishlist", "Item saved for later quick access!");
      }
      return updated;
    });
  };

  const addProduct = async (newProduct) => {
    if (!currentUser) {
      addNotification("Login Required", "Please login or register to list an item for sale.");
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/api/products`, {
        title: newProduct.title,
        price: newProduct.price,
        original_price: newProduct.originalPrice,
        condition: newProduct.condition,
        category: newProduct.category,
        image_url: newProduct.image,
        description: newProduct.description,
        tags: newProduct.tags
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addNotification("Listing Created!", `Successfully listed "${newProduct.title}" on the marketplace.`);
      fetchProducts(); // Refresh products from server
    } catch (error) {
      console.error("Error creating listing:", error);
      addNotification("Listing Failed", "Could not publish your listing. Please try again.");
    }
  };

  const addPost = (newPost) => {
    if (!currentUser) {
      addNotification("Login Required", "Please login or register to start a discussion.");
      return;
    }
    const item = {
      ...newPost,
      id: `post_${Date.now()}`,
      author: {
        name: user.name,
        branch: user.branch,
        year: user.year,
        avatar: user.avatar,
        isVerified: user.is_verified || user.isVerified
      },
      upvotes: 1,
      comments: [],
      createdAt: "Just now"
    };
    setPosts(prev => [item, ...prev]);
    addNotification("Post Published", "Your question/post was added to community forum.");
  };

  const addComment = (postId, commentText) => {
    if (!currentUser) {
      addNotification("Login Required", "Please login or register to comment.");
      return;
    }
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: `c_${Date.now()}`,
          author: user.name,
          year: user.year,
          avatar: user.avatar,
          content: commentText,
          createdAt: "Just now"
        };
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));
  };

  const upvotePost = (postId) => {
    if (!currentUser) {
      addNotification("Login Required", "Please login or register to upvote discussions.");
      return;
    }
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, upvotes: post.upvotes + 1 };
      }
      return post;
    }));
  };

  const startChatWithSeller = async (product) => {
    if (!currentUser) {
      addNotification("Login Required", "Please login or register to chat with sellers.");
      return;
    }

    const sellerId = product.seller.id;
    const productId = product.id;

    if (sellerId === currentUser.id) {
      addNotification("Listing Owner", "You cannot start a chat with yourself.");
      return;
    }

    // Try finding existing chat locally in the loaded list
    const existingChat = chats.find(c => 
      c.user.id === sellerId && 
      (!productId || !c.product || c.product.title === product.title)
    );

    if (existingChat) {
      setActiveChatId(existingChat.id);
    } else {
      const token = localStorage.getItem('token');
      try {
        // Send first message to initialize conversation in database
        const defaultText = `Hi! I'm interested in "${product.title}" listed for ₹${product.price}.`;
        await axios.post(`${API_URL}/api/chat/messages`, {
          receiver_id: sellerId,
          product_id: typeof productId === 'number' ? productId : null,
          text: defaultText
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        await fetchConversations();
        
        // Find and select the conversation
        const updatedConversations = await axios.get(`${API_URL}/api/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const newChat = updatedConversations.data.find(c => c.user.id === sellerId);
        if (newChat) {
          setActiveChatId(newChat.id);
        }
      } catch (err) {
        console.error("Failed to initiate chat conversation:", err);
      }
    }
    setIsChatOpen(true);
    setSelectedProductModal(null);
  };

  const sendMessage = async (chatId, text) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Parse partnerId and productId from chatId key format chat_{partnerId}_{productId}
    const parts = chatId.replace('chat_', '').split('_');
    const partnerId = parseInt(parts[0], 10);
    const productId = parts[1] && parts[1] !== '0' ? parseInt(parts[1], 10) : null;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({
          receiver_id: partnerId,
          product_id: productId,
          text: text
        }));
      } catch (err) {
        console.error("WS transmission error, fallback to REST:", err);
        sendViaHttp(partnerId, productId, text, token);
      }
    } else {
      sendViaHttp(partnerId, productId, text, token);
    }
  };

  const sendViaHttp = async (receiverId, productId, text, token) => {
    try {
      await axios.post(`${API_URL}/api/chat/messages`, {
        receiver_id: receiverId,
        product_id: productId,
        text: text
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConversations();
    } catch (err) {
      console.error("HTTP fallback message transmission failed:", err);
    }
  };

  const addNotification = (title, message) => {
    const notif = {
      id: `notif_${Date.now()}`,
      title,
      message,
      time: "Just now",
      unread: true
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const reportItem = (itemId, reason) => {
    if (!currentUser) {
      addNotification("Login Required", "Please login or register to report listings.");
      return;
    }
    addNotification("Report Submitted", "Our student moderation team will verify and remove fake/spam listings within 2 hours.");
    setSelectedProductModal(null);
  };

  return (
    <AppContext.Provider value={{
      user, verifyStudent,
      isDarkMode, toggleTheme,
      products, setProducts, fetchProducts, addProduct, reportItem,
      posts, addPost, addComment, upvotePost,
      chats, setChats, fetchConversations, activeChatId, setActiveChatId, startChatWithSeller, sendMessage,
      wishlist, toggleWishlist,
      notifications, setNotifications,
      activeTab, setActiveTab,
      searchQuery, setSearchQuery,
      selectedCategory, setSelectedCategory,
      priceFilter, setPriceFilter,
      conditionFilter, setConditionFilter,
      isWishlistOpen, setIsWishlistOpen,
      isChatOpen, setIsChatOpen,
      isSellModalOpen, setIsSellModalOpen,
      isVerifyModalOpen, setIsVerifyModalOpen,
      selectedProductModal, setSelectedProductModal,
      isCreatePostOpen, setIsCreatePostOpen,
      isNotificationsOpen, setIsNotificationsOpen,
      aiStudyResources
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
