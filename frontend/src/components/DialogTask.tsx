// {/* <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
//   <DialogContent className="max-w-6xl w-full max-h-[90vh] p-0">
//     <div className="flex h-full w-full">
//       <div className="flex-1 p-6 overflow-y-auto">
//         <DialogHeader className="flex-row items-center justify-between space-y-0 mb-6">
//           <div className="flex items-center gap-2 text-sm text-gray-600">
//             <span className="text-yellow-500">#</span>
//             <span>Getting Started 👋</span>
//             <span>/</span>
//             <span className="text-yellow-500">🏆</span>
//             <span>Bonus: Level Up 🏆</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button variant="ghost" size="sm">
//               <ChevronUp className="w-4 h-4" />
//             </Button>
//             <Button variant="ghost" size="sm">
//               <ChevronDown className="w-4 h-4" />
//             </Button>
//             <Button variant="ghost" size="sm">
//               <MoreHorizontal className="w-4 h-4" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setTaskDialogOpen(false)}
//             >
//               <X className="w-4 h-4" />
//             </Button>
//           </div>
//         </DialogHeader>

//         <div className="flex items-start gap-3 mb-6">
//           <Checkbox
//             checked={selectedTask?.completed || false}
//             className="mt-1"
//           />
//           <div className="flex-1">
//             <DialogTitle className="text-xl font-medium text-gray-900 mb-2">
//               {selectedTask?.title}
//             </DialogTitle>
//             <p className="text-gray-600 mb-4">{selectedTask?.description}</p>
//           </div>
//         </div>

//         {/* Add Sub-task */}
//         <Button
//           variant="ghost"
//           className="mb-6 text-gray-600 hover:text-gray-900"
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Add sub-task
//         </Button>

//         {/* Comment Section */}
//         <div className="space-y-4">
//           <div className="flex items-start gap-3">
//             <Avatar className="w-8 h-8">
//               <AvatarImage src="/placeholder-avatar.jpg" />
//               <AvatarFallback className="bg-red-500 text-white text-sm">
//                 M
//               </AvatarFallback>
//             </Avatar>
//             <div className="flex-1">
//               <Textarea
//                 placeholder="Comment"
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//                 className="min-h-[80px] resize-none"
//               />
//               <div className="flex items-center justify-end mt-2">
//                 <Button variant="ghost" size="sm">
//                   <Paperclip className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className=" bg-gray-50 p-6 border-l">
//         <div className="space-y-6">
//           {/* Project */}
//           <div>
//             <h3 className="text-sm font-medium text-gray-900 mb-2">Project</h3>
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <span className="text-yellow-500">#</span>
//               <span>Getting Started... / Bonus: Level U...</span>
//             </div>
//           </div>

//           {/* Date */}
//           <div>
//             <h3 className="text-sm font-medium text-gray-900 mb-2">Date</h3>
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <Calendar className="w-4 h-4" />
//               <span>{selectedTask?.dueDate || "24 Feb 2027"}</span>
//             </div>
//           </div>

//           {/* Deadline */}
//           <div>
//             <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
//               Deadline
//               <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
//                 <div className="w-2 h-2 bg-white rounded-full" />
//               </div>
//               <Lock className="w-4 h-4 text-gray-400" />
//             </h3>
//           </div>

//           {/* Priority */}
//           <div>
//             <h3 className="text-sm font-medium text-gray-900 mb-2">Priority</h3>
//             <div className="flex items-center gap-2">
//               <Flag
//                 className={cn(
//                   "w-4 h-4",
//                   getPriorityColor(selectedTask?.priority)
//                 )}
//               />
//               <span className="text-sm text-gray-600">
//                 {selectedTask?.priority || "P3"}
//               </span>
//             </div>
//           </div>

//           {/* Labels */}
//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="text-sm font-medium text-gray-900">Labels</h3>
//               <Button variant="ghost" size="sm">
//                 <Plus className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>

//           {/* Reminders */}
//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="text-sm font-medium text-gray-900">Reminders</h3>
//               <Button variant="ghost" size="sm">
//                 <Plus className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>

//           {/* Location */}
//           <div>
//             <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
//               Location
//               <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
//                 <div className="w-2 h-2 bg-white rounded-full" />
//               </div>
//               <Lock className="w-4 h-4 text-gray-400" />
//             </h3>
//           </div>
//         </div>
//       </div>
//     </div>
//   </DialogContent>
// </Dialog>; */}
