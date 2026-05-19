import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default sample users for initial testing
  const defaultUsers = [
    {
      id: "u1",
      name: "Ankit Kumrawat",
      email: "ankit.cse@college.edu",
      password: "password123",
      branch: "Computer Science Engg.",
      year: "3rd Year",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      collegeId: "COL-2024-8891"
    },
    {
      id: "u2",
      name: "Aarav Sharma",
      email: "aarav.cs22@college.edu",
      password: "password123",
      branch: "Computer Science",
      year: "4th Year (Senior)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      collegeId: "COL-2022-1042"
    },
    {
      id: "u3",
      name: "Priya Patel",
      email: "priya.ece@college.edu",
      password: "password123",
      branch: "Electronics",
      year: "3rd Year",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      collegeId: "COL-2024-4112"
    }
  ];

  // Retrieve or initialize registered users
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('campus_registered_users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  useEffect(() => {
    localStorage.setItem('campus_registered_users', JSON.stringify(users));
  }, [users]);

  // Retrieve or initialize currentUser (Default to null if none saved)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('campus_current_user');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('campus_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('campus_current_user');
    }
  }, [currentUser]);

  // Login function
  const login = (email, password) => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) {
      return { success: false, message: 'No account found with this email address.' };
    }
    if (foundUser.password !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }
    setCurrentUser(foundUser);
    return { success: true, message: `Welcome back, ${foundUser.name}!` };
  };

  // Register function
  const register = (name, email, password, branch, year) => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const isEdu = email.endsWith('.edu') || email.endsWith('.ac.in');
    const avatarList = [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
    ];
    const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];

    const newUser = {
      id: `u_${Date.now()}`,
      name,
      email,
      password,
      branch,
      year,
      avatar: randomAvatar,
      isVerified: isEdu,
      collegeId: `COL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, message: `Account created successfully! ${isEdu ? 'Student email verified.' : ''}` };
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('campus_current_user');
    return { success: true, message: 'Logged out successfully.' };
  };

  // Update verification status
  const verifyCurrentStudent = (email) => {
    if (!currentUser) return false;
    if (email && (email.endsWith('.edu') || email.endsWith('.ac.in'))) {
      const updated = { ...currentUser, isVerified: true, email };
      setCurrentUser(updated);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      login,
      register,
      logout,
      verifyCurrentStudent
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
