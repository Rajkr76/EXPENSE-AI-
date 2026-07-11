import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { X, PaperPlaneRight, Sparkle } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';

export default function AIChatScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: 'Hi! I am your AI financial assistant. Ask me anything about your expenses, budgets, or how to save more money.' }
  ]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = message.trim();
    setMessage('');
    
    // Add user message
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    
    setIsLoading(true);
    
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      const response = await fetch('http://192.168.1.8:8000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query: userMessage }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        text: data.reply || 'Sorry, I could not process that request.'
      }]);
    } catch (e) {
      console.error('AI Chat error:', e);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        text: 'Sorry, I could not connect to the server. Make sure the backend is running and try again.'
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Sparkle size={20} color={theme.colors.brandSecondary} weight="fill" />
            <Text style={styles.headerTitle}>ExpenseAI Assistant</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Chat Area */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.messageRow, msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant]}>
              {msg.role === 'assistant' && (
                <View style={styles.assistantAvatar}>
                  <Sparkle size={16} color={theme.colors.onBrandSecondary} weight="fill" />
                </View>
              )}
              
              <View style={[styles.messageBubble, msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant]}>
                <Text style={[styles.messageText, msg.role === 'user' ? styles.messageTextUser : styles.messageTextAssistant]}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageRow, styles.messageRowAssistant]}>
              <View style={styles.assistantAvatar}>
                <Sparkle size={16} color={theme.colors.onBrandSecondary} weight="fill" />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleAssistant]}>
                <ActivityIndicator size="small" color={theme.colors.brandSecondary} />
              </View>
            </View>
          )}
          
          {/* Quick Prompts - only show when there's just the initial message */}
          {messages.length <= 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsContainer}>
              {['How much did I spend on food?', 'Can I afford a new laptop?', 'Analyze my spending habits'].map((prompt, idx) => (
                <TouchableOpacity key={idx} style={styles.quickPromptBtn} onPress={() => setMessage(prompt)}>
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ScrollView>
        
        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything..."
              placeholderTextColor={theme.colors.onSurfaceTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              editable={!isLoading}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, (!message.trim() || isLoading) && { opacity: 0.5 }]} 
              onPress={handleSend}
              disabled={!message.trim() || isLoading}
            >
              <LinearGradient
                colors={[theme.colors.brandSecondary, '#6366F1']}
                style={styles.sendBtnGradient}
              >
                <PaperPlaneRight size={20} color={theme.colors.onBrandSecondary} weight="fill" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.semiBoldFontFamily,
    color: theme.colors.onSurface,
  },
  chatContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    maxWidth: '85%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
  },
  messageRowAssistant: {
    alignSelf: 'flex-start',
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brandSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
  },
  messageBubbleUser: {
    backgroundColor: theme.colors.surfaceTertiary,
    borderBottomRightRadius: 4,
  },
  messageBubbleAssistant: {
    backgroundColor: '#EEF2FF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  messageText: {
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.textFontFamily,
    lineHeight: 24,
  },
  messageTextUser: {
    color: theme.colors.onSurface,
  },
  messageTextAssistant: {
    color: '#312E81',
  },
  quickPromptsContainer: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  quickPromptBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  quickPromptText: {
    fontSize: theme.typography.scale.sm,
    fontFamily: theme.typography.mediumFontFamily,
    color: theme.colors.brandSecondary,
  },
  inputContainer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surfaceTertiary,
    borderRadius: theme.radius.xl,
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    fontSize: theme.typography.scale.base,
    fontFamily: theme.typography.textFontFamily,
    color: theme.colors.onSurface,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  sendBtn: {
    marginBottom: 4,
    marginLeft: theme.spacing.sm,
  },
  sendBtnGradient: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
