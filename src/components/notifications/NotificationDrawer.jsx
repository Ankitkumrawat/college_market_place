import React from 'react';
import { X, Bell, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function NotificationDrawer() {
  const { isNotificationsOpen, setIsNotificationsOpen, notifications, setNotifications } = useApp();

  if (!isNotificationsOpen) return null;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-slide-up">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Activity Notifications</h3>
              <p className="text-xs text-indigo-200 font-medium">Updates from your college community</p>
            </div>
          </div>
          <button 
            onClick={() => setIsNotificationsOpen(false)}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        {notifications.some(n => n.unread) && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-end">
            <button 
              onClick={markAllRead}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Mark all as read
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/60">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold">No notifications yet</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  notif.unread 
                    ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800/80 shadow-md ring-1 ring-indigo-500/20' 
                    : 'bg-slate-100/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex items-center">
                    {notif.unread && <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>}
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {notif.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-4">
                  {notif.message}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
