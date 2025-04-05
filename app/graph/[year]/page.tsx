"use client"

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { Download, Save, Copy, MessageSquare, Check, Info, Calendar, Edit, FileUp, Database } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import VoidGridBackground from "@/components/void-grid-background"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMobile } from "@/hooks/use-mobile"

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DEFAULT_COMMIT_MESSAGE = "Initial commit"

// Interface for commit data
interface CommitData {
  message: string
  date: string
}

// Interface for contribution data
interface ContributionData {
  hasContribution: boolean
  commit?: CommitData
}

export default function GraphPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const year = Number.parseInt(params.year as string)
  const isMobile = useMobile()

  const [contributions, setContributions] = useState<ContributionData[]>([])
  const [currentDay, setCurrentDay] = useState<number>(0)
  const [isLeapYear, setIsLeapYear] = useState<boolean>(false)
  const [totalDays, setTotalDays] = useState<number>(365)
  const [commitMessage, setCommitMessage] = useState<string>("")
  const [commitDrawerOpen, setCommitDrawerOpen] = useState<boolean>(false)
  const [infoDrawerOpen, setInfoDrawerOpen] = useState<boolean>(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [allCopied, setAllCopied] = useState<boolean>(false)
  const graphRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputYear, setInputYear] = useState<string>(year.toString())
  const [showTouchInstructions, setShowTouchInstructions] = useState<boolean>(true)

  // Check if it's a leap year
  useEffect(() => {
    if (isNaN(year)) {
      router.push("/")
      return
    }

    const leapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    setIsLeapYear(leapYear)
    setTotalDays(leapYear ? 366 : 365)

    // Initialize contributions array
    setContributions(
      Array(leapYear ? 366 : 365)
        .fill(null)
        .map(() => ({ hasContribution: false })),
    )

    // Try to load saved contributions
    const saved = localStorage.getItem(`contributions-${year}`)
    if (saved) {
      try {
        const savedContributions = JSON.parse(saved)
        if (Array.isArray(savedContributions) && savedContributions.length === (leapYear ? 366 : 365)) {
          setContributions(savedContributions)
        }
      } catch (e) {
        console.error("Failed to load saved contributions", e)
      }
    }
  }, [year, router])

  // Get day of week for January 1st of the selected year
  const getFirstDayOfYear = useCallback(() => {
    return new Date(year, 0, 1).getDay()
  }, [year])

  // Get month and day from day of year
  const getMonthAndDay = useCallback(
    (dayOfYear: number) => {
      const date = new Date(year, 0)
      date.setDate(dayOfYear + 1) // Add 1 because days are 0-indexed in our array
      return {
        month: date.getMonth(),
        day: date.getDate(),
      }
    },
    [year],
  )

  // Format date for Git commit
  const formatDateForGit = useCallback(
    (dayOfYear: number) => {
      const { month, day } = getMonthAndDay(dayOfYear)
      // Format: YYYY-MM-DD HH:MM:SS
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")} 12:00:00`
    },
    [year, getMonthAndDay],
  )

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (commitDrawerOpen) return // Don't handle keyboard events when drawer is open

      switch (e.key) {
        case "ArrowUp":
          setCurrentDay((prev) => Math.max(0, prev - 1))
          break
        case "ArrowDown":
          setCurrentDay((prev) => Math.min(totalDays - 1, prev + 1))
          break
        case "ArrowLeft":
          setCurrentDay((prev) => {
            const newDay = prev - 7
            return newDay >= 0 ? newDay : prev
          })
          break
        case "ArrowRight":
          setCurrentDay((prev) => {
            const newDay = prev + 7
            return newDay < totalDays ? newDay : prev
          })
          break
        case " ":
          toggleContribution(currentDay)
          break
        case "Enter":
          if (contributions[currentDay]?.hasContribution) {
            openCommitDrawer()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentDay, totalDays, contributions, commitDrawerOpen])

  // Scroll to current day when it changes
  useEffect(() => {
    if (graphRef.current) {
      const dayElement = document.getElementById(`day-${currentDay}`)
      if (dayElement) {
        dayElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }
  }, [currentDay])

  // Toggle contribution for a day
  const toggleContribution = (day: number) => {
    setContributions((prev) => {
      const newContributions = [...prev]
      const currentContribution = newContributions[day] || { hasContribution: false }

      // Toggle the contribution
      const newHasContribution = !currentContribution.hasContribution

      newContributions[day] = {
        ...currentContribution,
        hasContribution: newHasContribution,
      }

      // If turning on contribution, add default commit message
      if (newHasContribution) {
        newContributions[day].commit = {
          message: DEFAULT_COMMIT_MESSAGE,
          date: formatDateForGit(day),
        }
      } else {
        // If turning off contribution, remove commit message
        delete newContributions[day].commit
      }

      return newContributions
    })
  }

  // Open commit drawer
  const openCommitDrawer = () => {
    setCommitMessage(contributions[currentDay]?.commit?.message || DEFAULT_COMMIT_MESSAGE)
    setCommitDrawerOpen(true)
  }

  // Save commit message
  const saveCommitMessage = () => {
    if (!commitMessage.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a commit message.",
        variant: "destructive",
      })
      return
    }

    setContributions((prev) => {
      const newContributions = [...prev]
      newContributions[currentDay] = {
        ...newContributions[currentDay],
        commit: {
          message: commitMessage.trim(),
          date: formatDateForGit(currentDay),
        },
      }
      return newContributions
    })

    setCommitDrawerOpen(false)

    toast({
      title: "Commit Message Saved",
      description: "Your commit message has been updated for this day.",
    })
  }

  // Save contributions to localStorage
  const saveContributions = () => {
    localStorage.setItem(`contributions-${year}`, JSON.stringify(contributions))
    toast({
      title: "Saved",
      description: `Contributions for ${year} have been saved.`,
    })
  }

  // Load contributions from localStorage
  const loadContributions = () => {
    const saved = localStorage.getItem(`contributions-${year}`)
    if (saved) {
      setContributions(JSON.parse(saved))
      toast({
        title: "Loaded",
        description: `Contributions for ${year} have been loaded.`,
      })
    } else {
      toast({
        title: "No Data",
        description: `No saved contributions found for ${year}.`,
        variant: "destructive",
      })
    }
  }

  // Export contributions as JSON
  const exportContributions = () => {
    const dataStr = JSON.stringify(contributions)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `contributions-${year}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)

        // Validate the data
        if (Array.isArray(jsonData) && jsonData.length === totalDays) {
          // Check if the data has the expected structure
          const isValid = jsonData.every(
            (item) =>
              typeof item === "object" &&
              "hasContribution" in item &&
              (!item.commit || (typeof item.commit === "object" && "message" in item.commit && "date" in item.commit)),
          )

          if (isValid) {
            setContributions(jsonData)
            toast({
              title: "File Loaded",
              description: `Contributions from file have been loaded successfully.`,
            })
          } else {
            throw new Error("Invalid data structure in JSON file")
          }
        } else {
          throw new Error(`Expected an array of ${totalDays} items`)
        }
      } catch (error) {
        console.error("Error parsing JSON file:", error)
        toast({
          title: "Error",
          description: `Failed to load file: ${error instanceof Error ? error.message : "Invalid JSON format"}`,
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Copy a single commit command to clipboard
  const copyCommit = (day: number) => {
    const contribution = contributions[day]
    if (!contribution?.commit) return

    const { message, date } = contribution.commit
    const gitCommand = `GIT_AUTHOR_DATE="${date}" GIT_COMMITTER_DATE="${date}" git commit --allow-empty -m "${message.replace(/"/g, '\\"')}"`

    navigator.clipboard.writeText(gitCommand).then(() => {
      setCopiedIndex(day)
      setTimeout(() => setCopiedIndex(null), 2000)

      toast({
        title: "Copied",
        description: "Git commit command copied to clipboard.",
      })
    })
  }

  // Copy all commit commands to clipboard
  const copyAllCommits = () => {
    const commands = contributions
      .map((contribution, index) => {
        if (!contribution?.hasContribution || !contribution?.commit) return null

        const { message, date } = contribution.commit
        return `GIT_AUTHOR_DATE="${date}" GIT_COMMITTER_DATE="${date}" git commit --allow-empty -m "${message.replace(/"/g, '\\"')}"`
      })
      .filter(Boolean)
      .join("\n\n")

    if (!commands) {
      toast({
        title: "No Commits",
        description: "There are no commit messages to copy.",
        variant: "destructive",
      })
      return
    }

    navigator.clipboard.writeText(commands).then(() => {
      setAllCopied(true)
      setTimeout(() => setAllCopied(false), 2000)

      toast({
        title: "All Copied",
        description: "All git commit commands copied to clipboard.",
      })
    })
  }

  // Check if device supports touch
  const isTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
  }

  // Generate the contribution grid
  const renderGrid = () => {
    const firstDayOfYear = getFirstDayOfYear()
    const grid = []

    // Calculate number of weeks needed (ceiling of (firstDayOfYear + totalDays) / 7)
    const totalWeeks = Math.ceil((firstDayOfYear + totalDays) / 7)

    // Create the main grid container
    const gridContainer = (
      <div key="grid-container" id="grid-container" className="grid grid-flow-col auto-cols-min gap-1 touch-none">
        {/* Weeks columns */}
        {Array.from({ length: totalWeeks }).map((_, week) => (
          <div key={`week-${week}`} className="grid grid-rows-7 gap-1">
            {/* Days in this week */}
            {Array.from({ length: 7 }).map((_, dayOfWeek) => {
              // Calculate the day number
              const dayNumber = week * 7 + dayOfWeek - firstDayOfYear

              // Check if this is a valid day in our year
              if (dayNumber >= 0 && dayNumber < totalDays) {
                const { month, day: dayOfMonth } = getMonthAndDay(dayNumber)
                const isSelected = currentDay === dayNumber
                const contribution = contributions[dayNumber] || { hasContribution: false }
                const hasContribution = contribution.hasContribution
                const hasCommit = !!contribution.commit
                const isDefaultMessage = hasCommit && contribution.commit?.message === DEFAULT_COMMIT_MESSAGE

                return (
                  <div
                    id={`day-${dayNumber}`}
                    key={`day-${dayNumber}`}
                    className={`
                      w-6 h-6 flex items-center justify-center text-xs
                      ${hasContribution ? "bg-white text-gray-800" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}
                      ${isSelected ? "outline-none border-2 border-gray-400 dark:border-gray-500" : ""}
                      ${hasCommit && !isDefaultMessage ? "border-2 border-white dark:border-white" : ""}
                      cursor-pointer transition-colors relative
                      active:opacity-70 touch-action-manipulation
                      hover:opacity-80
                    `}
                    onClick={() => {
                      setCurrentDay(dayNumber)
                      toggleContribution(dayNumber)
                    }}
                    onDoubleClick={() => {
                      if (hasContribution) {
                        setCurrentDay(dayNumber)
                        openCommitDrawer()
                      }
                    }}
                    onTouchStart={(e) => {
                      // Set up touch timer for long press
                      const touchTimer = setTimeout(() => {
                        toggleContribution(dayNumber)
                        // Add haptic feedback if available
                        if (window.navigator && window.navigator.vibrate) {
                          window.navigator.vibrate(50)
                        }
                      }, 500) // 500ms for long press

                      // Store the timer in the element's dataset
                      e.currentTarget.dataset.touchTimer = String(touchTimer)
                    }}
                    onTouchEnd={(e) => {
                      // Clear the long press timer
                      const timer = e.currentTarget.dataset.touchTimer
                      if (timer) {
                        clearTimeout(Number(timer))
                        delete e.currentTarget.dataset.touchTimer
                      }
                    }}
                    onTouchMove={(e) => {
                      // Clear the long press timer if user moves finger
                      const timer = e.currentTarget.dataset.touchTimer
                      if (timer) {
                        clearTimeout(Number(timer))
                        delete e.currentTarget.dataset.touchTimer
                      }
                    }}
                    title={`${MONTHS[month]} ${dayOfMonth}, ${year}${hasCommit ? ` - ${contribution.commit?.message}` : ""}`}
                  >
                    {hasContribution ? "■" : "□"}
                    {hasCommit && !isDefaultMessage && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-500 rounded-full"></div>
                    )}
                  </div>
                )
              }

              // Empty cell for days outside our year
              return <div key={`empty-${week}-${dayOfWeek}`} className="w-6 h-6"></div>
            })}
          </div>
        ))}
      </div>
    )

    grid.push(gridContainer)

    return grid
  }

  // Handle double tap for touch devices
  useEffect(() => {
    let lastTap = 0
    let touchTimeout: NodeJS.Timeout | null = null

    const handleTouchStart = (e: TouchEvent) => {
      const currentTime = new Date().getTime()
      const tapLength = currentTime - lastTap

      if (tapLength < 300 && tapLength > 0) {
        // Double tap detected
        const element = e.target as HTMLElement
        const dayId = element.id

        if (dayId && dayId.startsWith("day-")) {
          const dayNumber = Number.parseInt(dayId.replace("day-", ""), 10)
          if (!isNaN(dayNumber) && contributions[dayNumber]?.hasContribution) {
            setCurrentDay(dayNumber)
            openCommitDrawer()

            // Prevent additional handling
            e.preventDefault()
          }
        }

        // Clear any existing timeout
        if (touchTimeout) {
          clearTimeout(touchTimeout)
          touchTimeout = null
        }
      } else {
        // This is a single tap
        // Set a timeout to handle single tap actions
        if (touchTimeout) {
          clearTimeout(touchTimeout)
        }

        touchTimeout = setTimeout(() => {
          // Single tap handling is done by the onClick handler
          touchTimeout = null
        }, 300)
      }

      lastTap = currentTime
    }

    // Add event listener to the graph container
    const graphElement = graphRef.current
    if (graphElement) {
      graphElement.addEventListener("touchstart", handleTouchStart, { passive: false })
    }

    return () => {
      if (graphElement) {
        graphElement.removeEventListener("touchstart", handleTouchStart)
      }
      if (touchTimeout) {
        clearTimeout(touchTimeout)
      }
    }
  }, [contributions, setCurrentDay, contributions])

  // Count commits with custom messages (not default)
  const customCommitCount = contributions.filter(
    (c) => c.hasContribution && c.commit && c.commit.message !== DEFAULT_COMMIT_MESSAGE,
  ).length

  // Count total contributions
  const contributionCount = contributions.filter((c) => c.hasContribution).length

  // Auto-hide touch instructions after 10 seconds
  useEffect(() => {
    if (showTouchInstructions) {
      const timer = setTimeout(() => {
        setShowTouchInstructions(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [showTouchInstructions])

  // Format current date
  const formatCurrentDate = () => {
    if (currentDay >= 0 && currentDay < totalDays) {
      const { month, day } = getMonthAndDay(currentDay)
      return `${MONTHS[month]} ${day}, ${year}`
    }
    return ""
  }

  return (
    <>
      <VoidGridBackground />
      <style
        dangerouslySetInnerHTML={{
          __html: `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .glass-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .dark .glass-panel {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  @media (max-width: 640px) {
    #grid-container .w-6.h-6 {
      width: 1.75rem;
      height: 1.75rem;
    }
  }
  
  /* Remove focus outline */
  *:focus {
    outline: none !important;
  }
  
  /* Improve touch scrolling */
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
    overflow-x: scroll;
  }
`,
        }}
      />

      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Top navigation bar with logo and controls */}
        <div className="fixed top-0 left-0 right-0 z-20 glass-panel py-3 px-4 flex justify-between items-center">
          {/* Logo on left */}
          <div className="flex flex-col items-center">
            <div className="flex gap-1" role="heading" aria-label="TIMEWRAP">
              {["T", "I", "M", "E", "W", "R", "A", "P"].map((letter, index) => (
                <div
                  key={index}
                  className="w-5 h-5 sm:w-6 sm:h-6 bg-black/30 border border-white/20 text-white flex items-center justify-center text-xs font-bold uppercase backdrop-blur-sm"
                  aria-hidden="true"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div
              className="text-gray-800/70 dark:text-white/70 font-mono text-xs sm:text-sm mt-1 tracking-wide uppercase italic"
              role="heading"
              aria-label="COMMIT ANYWHERE IN TIME"
            >
              Commit Anywhere in Time
            </div>
          </div>

          {/* Year input and info on right */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300 mr-1" />
              <input
                type="text"
                value={inputYear}
                onChange={(e) => setInputYear(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const newYear = Number.parseInt(inputYear)
                    if (!isNaN(newYear) && newYear > 0) {
                      router.push(`/graph/${newYear}`)
                    } else {
                      toast({
                        title: "Invalid Year",
                        description: "Please enter a valid year.",
                        variant: "destructive",
                      })
                      setInputYear(year.toString())
                    }
                  }
                }}
                onBlur={() => setInputYear(year.toString())}
                className="text-lg sm:text-xl font-bold bg-transparent border-b border-gray-400 focus:border-gray-600 dark:focus:border-gray-300 focus:outline-none w-16 sm:w-24 text-center py-1"
              />
              {isLeapYear && (
                <span className="text-xs px-1 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-none ml-1">
                  Leap
                </span>
              )}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setInfoDrawerOpen(true)}>
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Help &amp; Instructions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Main graph content */}
        <div className="flex-1 flex items-center justify-center w-full mt-24 mb-24 md:mb-20 overflow-hidden">
          <div
            ref={graphRef}
            className="overflow-x-auto p-4 md:p-6 rounded-none scrollbar-hide focus:outline-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch", // Add this for better iOS scrolling
              touchAction: "pan-x", // Allow horizontal panning
            }}
            tabIndex={0}
          >
            <div className="min-w-max">{renderGrid()}</div>
          </div>
        </div>

        {/* Selected day info panel */}
        {currentDay >= 0 && currentDay < totalDays && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-20 glass-panel px-4 py-2 text-center">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="text-sm font-medium">{formatCurrentDate()}</div>
              <span className="text-xs sm:ml-2 text-gray-500 dark:text-gray-400">
                (Day {currentDay + 1} of {totalDays})
              </span>
            </div>

            {contributions[currentDay]?.hasContribution && (
              <div className="mt-1 flex justify-center">
                <Button size="sm" variant="ghost" onClick={openCommitDrawer} className="h-7 px-2 text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  {contributions[currentDay]?.commit?.message === DEFAULT_COMMIT_MESSAGE
                    ? "Add commit message"
                    : "Edit commit message"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Bottom control panel */}
        <div className="fixed bottom-0 left-0 right-0 z-20 glass-panel">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-2 sm:gap-4">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row w-full gap-2">
                {/* First row on mobile - Save and Import */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
                  <Button variant="outline" size="sm" onClick={saveContributions} className="w-full sm:min-w-[80px]">
                    <Save className="h-4 w-4 mr-2" />
                    <span>Save</span>
                  </Button>

                  <Button variant="outline" size="sm" onClick={triggerFileUpload} className="w-full sm:min-w-[80px]">
                    <FileUp className="h-4 w-4 mr-2" />
                    <span>Import</span>
                  </Button>
                </div>

                <input type="file" ref={fileInputRef} accept=".json" onChange={handleFileUpload} className="hidden" />

                {/* Second row on mobile - Load and Export */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
                  <Button variant="outline" size="sm" onClick={loadContributions} className="w-full sm:min-w-[80px]">
                    <Database className="h-4 w-4 mr-2" />
                    <span>Load</span>
                  </Button>

                  <Button variant="outline" size="sm" onClick={exportContributions} className="w-full sm:min-w-[80px]">
                    <Download className="h-4 w-4 mr-2" />
                    <span>Export</span>
                  </Button>
                </div>

                {/* Commits button - more prominent */}
                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button
                        variant="default"
                        size="default"
                        className="w-full sm:min-w-[100px] bg-white text-gray-800 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-200 dark:hover:bg-gray-200 border-2 border-gray-400 font-medium"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span>Commits ({contributionCount})</span>
                      </Button>
                    </DrawerTrigger>

                    <DrawerContent className="rounded-none">
                      <div className="mx-auto w-full max-w-4xl">
                        <DrawerHeader>
                          <DrawerTitle>Git Commit Messages</DrawerTitle>
                          <DrawerDescription>
                            Copy these commands to recreate your contribution graph on GitHub
                          </DrawerDescription>
                        </DrawerHeader>

                        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                          <Button
                            onClick={copyAllCommits}
                            className="w-full rounded-none"
                            disabled={contributionCount === 0}
                          >
                            {allCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            Copy All Commands ({contributionCount})
                          </Button>

                          <div className="space-y-4">
                            {contributions.map((contribution, index) => {
                              if (!contribution?.hasContribution || !contribution?.commit) return null

                              const { month, day } = getMonthAndDay(index)
                              const dateStr = `${MONTHS[month]} ${day}, ${year}`
                              const isDefaultMessage = contribution.commit.message === DEFAULT_COMMIT_MESSAGE

                              return (
                                <div
                                  key={`commit-${index}`}
                                  className={`p-3 border rounded-none ${isDefaultMessage ? "" : "border-gray-400 dark:border-gray-500"}`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium">{dateStr}</div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyCommit(index)}
                                      className="h-6 px-2 rounded-none"
                                    >
                                      {copiedIndex === index ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    {contribution.commit.message}
                                    {isDefaultMessage && <span className="text-xs text-gray-400 ml-2">(default)</span>}
                                  </div>
                                  <div className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded-none font-mono overflow-x-auto">
                                    GIT_AUTHOR_DATE="{contribution.commit.date}" GIT_COMMITTER_DATE="
                                    {contribution.commit.date}" git commit --allow-empty -m "
                                    {contribution.commit.message}"
                                  </div>
                                </div>
                              )
                            })}

                            {contributionCount === 0 && (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No contributions added yet. Use spacebar to toggle contributions on the graph.
                              </div>
                            )}
                          </div>
                        </div>

                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant="outline" className="rounded-none">
                              Close
                            </Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info drawer */}
        <Drawer open={infoDrawerOpen} onOpenChange={setInfoDrawerOpen}>
          <DrawerContent className="rounded-none">
            <div className="mx-auto w-full max-w-md">
              <DrawerHeader>
                <DrawerTitle>TimeWrap Instructions</DrawerTitle>
                <DrawerDescription>Create and export your custom GitHub contribution graph</DrawerDescription>
              </DrawerHeader>

              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Keyboard Controls</h3>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Arrow keys: Navigate between days</li>
                    <li>• Spacebar: Toggle contribution for selected day</li>
                    <li>• Enter: Edit commit message for selected day</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Touch Controls</h3>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Tap: Toggle contribution</li>
                    <li>• Double tap: Edit commit message</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-1">How to Use</h3>
                  <ol className="text-sm space-y-1 text-gray-700 dark:text-gray-300 list-decimal pl-4">
                    <li>Select a year using the input at the top</li>
                    <li>Toggle contributions on days you want to appear on GitHub</li>
                    <li>Add custom commit messages for more realism</li>
                    <li>Export your pattern or copy the Git commands</li>
                    <li>Run the commands in your Git repository to recreate the pattern</li>
                  </ol>
                </div>
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline" className="rounded-none">
                    Got it
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Commit Message Drawer */}
        <Drawer open={commitDrawerOpen} onOpenChange={setCommitDrawerOpen}>
          <DrawerContent className="rounded-none">
            <div className="mx-auto w-full max-w-md">
              <DrawerHeader>
                <DrawerTitle>Edit Commit Message</DrawerTitle>
                <DrawerDescription>
                  {(() => {
                    if (currentDay >= 0 && currentDay < totalDays) {
                      const { month, day } = getMonthAndDay(currentDay)
                      return `Customize the commit message for ${MONTHS[month]} ${day}, ${year}`
                    }
                    return "Customize the commit message"
                  })()}
                </DrawerDescription>
              </DrawerHeader>

              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="commit-message">Commit Message</Label>
                  <Textarea
                    id="commit-message"
                    placeholder="Initial commit"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="min-h-[100px] rounded-none"
                  />
                </div>
              </div>

              <DrawerFooter>
                <Button variant="outline" onClick={() => setCommitDrawerOpen(false)} className="rounded-none">
                  Cancel
                </Button>
                <Button onClick={saveCommitMessage} className="rounded-none">
                  Save Message
                </Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Creator info footer */}
        <div className="fixed bottom-24 left-0 right-0 z-10 text-center text-xs text-gray-500 dark:text-gray-400 py-1">
          <p>
            Created by{" "}
            <a
              href="https://ompreetham.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              Om Preetham Bandi
            </a>
          </p>
        </div>
      </main>
    </>
  )
}

