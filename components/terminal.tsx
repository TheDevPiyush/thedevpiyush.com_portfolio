"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { commands } from "@/lib/commands"
import { useRouter } from "next/navigation"
import { supabaseBrowser as supabase } from "@/lib/supabase/browser"
import { toast } from "sonner"
import { useUserStore } from "@/lib/useStore"

interface TerminalLine {
  type: "input" | "output" | "error"
  content: string
  timestamp?: Date
}

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const router = useRouter();
  const { clearUser } = useUserStore();
  // Auto-focus input and show welcome message
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }

    const welcomeLines = [
      "╔══════════════════════════════════════════════════════════════╗",
      "║                Piyush Choudhary - PORTFOLIO v2.0             ║",
      "║                  Full-Stack & Blockchain Dev                 ║",
      "╚══════════════════════════════════════════════════════════════╝",
      "",
      "Welcome to thedevpiyush.com!",
      "Type 'help' to see available commands or 'about' to learn more about me.",
      "",
    ]

    welcomeLines.forEach((line, index) => {
      setTimeout(() => {
        setLines((prev) => [...prev, { type: "output", content: line as string }])
      }, index * 100)
    })
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  const typeText = useCallback(async (text: string, delay = 20) => {
    setIsTyping(true)
    const lines = text.split("\n")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.trim() === "") {
        setLines((prev) => [...prev, { type: "output", content: "" }])
        await new Promise((resolve) => setTimeout(resolve, 50))
        continue
      }

      // Add the complete line at once for better readability
      setLines((prev) => [...prev, { type: "output", content: line }])
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
    setIsTyping(false)
  }, [])

  const executeCommand = useCallback(
    async (input: string) => {
      const trimmedInput = input.trim().toLowerCase()

      // Add input to history
      if (trimmedInput && !commandHistory.includes(trimmedInput)) {
        setCommandHistory((prev) => [...prev, trimmedInput])
      }
      setHistoryIndex(-1)

      // Add input line
      setLines((prev) => [...prev, { type: "input", content: `\nC:/Portfolio/thedevpiyush.com > ${input}\n` }])

      if (!trimmedInput) return

      // Find and execute command
      const command = commands.find((cmd) => cmd.name === trimmedInput || cmd.aliases?.includes(trimmedInput))

      if (command) {
        if (command.name === "clear" || command.aliases?.includes("cls")) {
          setLines([{ type: "input", content: `\nC:/Portfolio/thedevpiyush.com > ${input}\n` }]);
          return
        }

        if (command.name === "open-ui" || command.aliases?.includes("ui")) {
          if (typeof window !== "undefined") {
            router.push("/");
            return
          }
        }

        if (command.name === "exit" || command.aliases?.includes("quit")) {
          if (typeof window !== "undefined") {
            router.push("/");
            return
          }
        }

        if (command.name === "admin-signin" || command.aliases?.includes("admin-login")) {
          if (typeof window !== "undefined") {
            router.push("/admin/signin");
            return
          }
        }

        if (command.name === "admin-signout" || command.aliases?.includes("admin-logout")) {
          if (typeof window !== "undefined") {
            await supabase.auth.signOut();
            clearUser();
            toast.success("Signed out successfully")
            router.push("/");
            return
          }
        }

        if (command.name === "admin-postblog" || command.aliases?.includes("admin-post-blog")) {
          if (typeof window !== "undefined") {
            router.push("/admin/postblog");
            return
          }
        }

        const result = await command.execute()
        if (typeof result === "string") {
          await typeText(result)
        } else {
          console.error("Command execute() did not return a string:", result)
          setLines((prev) => [
            ...prev,
            {
              type: "error",
              content: `Error: Command returned invalid result type.`,
            },
          ])
        }
      } else {
        setLines((prev) => [
          ...prev,
          {
            type: "error",
            content: `Command not found: ${trimmedInput}. Type 'help' for available commands.`,
          },
        ])
      }
    },
    [commandHistory, typeText],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isTyping) return

    if (e.key === "Enter") {
      executeCommand(currentInput)
      setCurrentInput("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCurrentInput("")
        } else {
          setHistoryIndex(newIndex)
          setCurrentInput(commandHistory[newIndex])
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      // Simple autocomplete
      const matches = commands.filter((cmd) => cmd.name.startsWith(currentInput.toLowerCase()))
      if (matches.length === 1) {
        setCurrentInput(matches[0].name)
      }
    }
  }

  const handleClear = () => {
    setLines([])
  }

  // Add clear command to global scope
  useEffect(() => {
    ; (window as any).clearTerminal = handleClear
  }, [])

  return (
    <div className="h-screen flex flex-col bg-black text-green-400 relative">
      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 pb-20 sm:pb-24"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="space-y-1">
          {lines.map((line, index) => (
            <div
              key={index}
              className={`break-words whitespace-pre-wrap text-xs sm:text-sm ${line.type === "input" ? "text-yellow-400 font-bold font-mono" : line.type === "error" ? "text-red-400" : "text-green-400"
                }`}
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
              {line.content}
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-green-800 p-2 sm:p-4">
        <div className="flex items-center space-x-2">
          <span className="text-green-300 text-xs sm:text-sm flex-shrink-0">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-green-400 caret-green-400 text-xs sm:text-sm min-w-0"
            placeholder={isTyping ? "Processing..." : "Type a command..."}
            disabled={isTyping}
            autoComplete="off"
            spellCheck={false}
          />
          <div className="text-green-600 text-xs flex-shrink-0">{isTyping ? "⏳" : "●"}</div>
        </div>

        <div className="text-green-600 text-xs mt-1 text-center hidden sm:block">
          Use ↑↓ for command history • Tab for autocomplete • type help for commands
        </div>
        <div className="text-green-600 text-xs mt-1 text-center sm:hidden">type help for commands</div>
      </div>
    </div>
  )
}
