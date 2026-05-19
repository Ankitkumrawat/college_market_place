import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialProducts, initialPosts, initialChats, aiStudyResources } from '../data/mockData';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { currentUser, verifyCurrentStudent } = useAuth();

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
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('campus_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  useEffect(() => {
    localStorage.setItem('campus_products', JSON.stringify(products));
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
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('campus_chats');
    return saved ? JSON.parse(saved) : initialChats;
  });

  useEffect(() => {
    localStorage.setItem('campus_chats', JSON.stringify(chats));
  }, [chats]);

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

  const addProduct = (newProduct) => {
    if (!currentUser) {
      addNotification("Login Required", "Please login or register to list an item for sale.");
      return;
    }
    const item = {
      ...newProduct,
      id: `p_${Date.now()}`,
      seller: {
        id: user.id,
        name: user.name,
        branch: user.branch,
        year: user.year,
        avatar: user.avatar,
        isVerified: user.isVerified,
        collegeEmail: user.email || user.collegeEmail,
        rating: 5.0
      },
      createdAt: "Just now",
      tags: newProduct.tags || ["CollegeItem"]
    };
    setProducts(prev => [item, ...prev]);
    addNotification("Listing Created!", `Successfully listed "${item.title}" on the marketplace.`);
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
        isVerified: user.isVerified
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

  const startChatWithSeller = (product) => {
    if (!currentUser) {
      addNotification("Login Required", "Please login or register to chat with sellers.");
      return;
    }
    let existingChat = chats.find(c => c.product.title === product.title);
    if (!existingChat) {
      existingChat = {
        id: `chat_${Date.now()}`,
        user: product.seller,
        product: { title: product.title, price: product.price },
        lastMessage: `Hi! I'm interested in "${product.title}".`,
        lastMessageTime: "Just now",
        unread: false,
        messages: [
          { sender: "me", text: `Hi! I'm interested in "${product.title}" listed for ₹${product.price}.`, time: "Just now" },
          { sender: "them", text: `Hello ${user.name}! Yes, it's available. When would you like to inspect it?`, time: "Just now" }
        ]
      };
      setChats(prev => [existingChat, ...prev]);
    }
    setActiveChatId(existingChat.id);
    setIsChatOpen(true);
    setSelectedProductModal(null);
  };

  const sendMessage = (chatId, text) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = [...chat.messages, { sender: "me", text, time: "Just now" }];
        return { ...chat, messages: updatedMessages, lastMessage: text, lastMessageTime: "Just now" };
      }
      return chat;
    }));

    setTimeout(() => {
      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          const replies = [
            "Sure! Sounds good to me.",
            "Let's coordinate over call or meet near the campus library.",
            "Awesome. See you then!",
            "I can bring it tomorrow morning during 1st lecture break."
          ];
          const replyText = replies[Math.floor(Math.random() * replies.length)];
          const updatedMessages = [...chat.messages, { sender: "them", text: replyText, time: "Just now" }];
          return { ...chat, messages: updatedMessages, lastMessage: replyText, lastMessageTime: "Just now", unread: true };
        }
        return chat;
      }));
      addNotification("New Chat Message", "You received a reply about your item inquiry.");
    }, 1500);
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
      products, addProduct, reportItem,
      posts, addPost, addComment, upvotePost,
      chats, activeChatId, setActiveChatId, startChatWithSeller, sendMessage,
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
