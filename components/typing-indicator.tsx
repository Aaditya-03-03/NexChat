"use client"

import { motion, AnimatePresence } from 'framer-motion'

interface TypingIndicatorProps {
    typingUsers: string[]
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    if (typingUsers.length === 0) return null

    const getTypingText = () => {
        if (typingUsers.length === 1) {
            return `${typingUsers[0]} is typing`
        } else if (typingUsers.length === 2) {
            return `${typingUsers[0]} and ${typingUsers[1]} are typing`
        } else {
            return `${typingUsers[0]}, ${typingUsers[1]}, and ${typingUsers.length - 2} ${typingUsers.length - 2 === 1 ? 'other' : 'others'} are typing`
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground"
            >
                <span>{getTypingText()}</span>
                <div className="flex gap-1">
                    <motion.span
                        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0
                        }}
                    />
                    <motion.span
                        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.2
                        }}
                    />
                    <motion.span
                        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.4
                        }}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
