import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Info,
  User,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import {
  mockAdvisorQuestions,
  mockAdvisorResponses,
  mockProfile,
} from '../data/mockData';

export default function Advisor() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello ${mockProfile.name}! I am your MoneyTwin Financial Advisor. I have analyzed your digital twin metrics:

• **Net Worth:** ₹30.60 Lakhs
• **Monthly Savings Rate:** 58.1% (₹1,22,000/mo)
• **Emergency Runway:** 7.4 Months (₹6.50 Lakhs reserve)
• **Debt-to-Income:** 8.8% (HDFC Auto Loan EMI: ₹18,500)

Ask me about optimizing your wealth, stress-testing loans, or simulating your trajectory over the next 5 years.`,
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleAskQuestion = (question) => {
    if (!question.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: question,
      timestamp: 'Just now',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let botReplyText =
        mockAdvisorResponses[question] ||
        `Based on your digital twin (Net Worth: ₹30.6 Lakhs, Monthly Surplus: ₹1.22 Lakhs):

For your inquiry regarding "${question}":
1. **Cash Flow Impact:** Your high savings rate (58%) provides strong flexibility.
2. **Safety Net:** Your 7.4-month emergency reserve protects against near-term liquidity shocks.
3. **Recommendation:** Before executing major capital moves, test them inside the **What-If Simulator** tab to observe exact 3-year net worth deviations.

*(Note: Live Google Gemini 1.5 API intelligence with real-time semantic reasoning will be integrated in Phase 3).*`;

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReplyText,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: `Chat reset. I am ready to advise you on your financial twin state. Select a suggested scenario question below or enter your own query.`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader
        badge={
          <Badge variant="purple" size="sm">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Strategy Mentor
          </Badge>
        }
        title="AI Financial Advisor"
        description="Context-grounded personal financial reasoning powered by your digital twin state."
        action={
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
          >
            Clear Conversation
          </button>
        }
      />

      {/* Synthetic Demo Notice Banner */}
      <div className="rounded-xl bg-purple-950/20 border border-purple-800/40 p-3.5 flex items-start space-x-3 text-xs text-purple-200">
        <Info className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-white">
            Frontend Prototype Mode (Synthetic Intelligence)
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            This conversational interface is currently running in prototype mode using deterministic twin modeling. In the next development milestone, this interface will connect to the live Google Gemini API with RAG-based context injection.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800/90 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] ${
                    msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Bot className="h-4 w-4 text-purple-400 animate-pulse" />
              <span>MoneyTwin Advisor is computing scenario...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompt Pills */}
        <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-950/40">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span>Suggested Twin Questions</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {mockAdvisorQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleAskQuestion(q)}
                disabled={isTyping}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion(inputQuery);
          }}
          className="p-4 border-t border-slate-800/80 bg-slate-950 flex items-center space-x-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask your financial twin a question (e.g. Can I afford a vacation?)..."
            disabled={isTyping}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs transition flex items-center space-x-1.5"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
