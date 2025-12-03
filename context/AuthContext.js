// Authentication context for managing user state
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial auth state
const initialAuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null
};

// Auth action types
const authActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActionTypes.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case authActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null
      };
      
    case authActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload
      };
      
    case authActionTypes.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      };
      
    case authActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case authActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: authActionTypes.SET_LOADING, payload: true });
      
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          dispatch({ 
            type: authActionTypes.LOGIN_SUCCESS, 
            payload: data.user 
          });
          return;
        }
      }
      
      // Not authenticated
      dispatch({ type: authActionTypes.LOGOUT });
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch({ type: authActionTypes.LOGOUT });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: authActionTypes.LOGIN_START });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ 
          type: authActionTypes.LOGIN_SUCCESS, 
          payload: data.user 
        });
        return { success: true };
      } else {
        dispatch({ 
          type: authActionTypes.LOGIN_FAILURE, 
          payload: data.error 
        });
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      dispatch({ 
        type: authActionTypes.LOGIN_FAILURE, 
        payload: errorMessage 
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    dispatch({ type: authActionTypes.LOGOUT });
  };

  const setUser = (user) => {
    dispatch({ 
      type: authActionTypes.LOGIN_SUCCESS, 
      payload: user 
    });
  };

  const clearError = () => {
    dispatch({ type: authActionTypes.CLEAR_ERROR });
  };

  const contextValue = {
    ...state,
    login,
    logout,
    setUser,
    clearError,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;