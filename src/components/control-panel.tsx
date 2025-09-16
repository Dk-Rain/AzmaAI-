
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    PenSquare, Loader2, Check, AlertCircle, Sparkles, 
    Trash2, Search, Library, PlusCircle, FolderPlus, MountainIcon, Folder, File, GripVertical, ChevronDown, MoreHorizontal, Edit, FolderInput, PenLine, Archive, Share2, Gauge, X, FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DocumentContent, References, StyleOptions, FontType, Workspace, Project, DocumentItem } from '@/types';
import { GenerationSchema, GenerationFormValues, availableFonts } from '@/types';
import { academicTaskTypes } from '@/types/academic-task-types';
import { academicTaskFormats } from '@/types/academic-task-formats';

import { 
  generateContentAction,
} from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AcademicTaskType } from '@/types/academic-task-types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, DropdownMenuPortal } from './ui/dropdown-menu';
import { Label } from './ui/label';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Progress } from './ui/progress';
import { useRouter } from 'next/navigation';
import { Switch } from './ui/switch';


type UserData = {
  uid: string;
  fullName: string;
  role: string;
  email: string;
  username?: string;
  photoUrl?: string;
  isPremium?: boolean;
}

const UsageMeter = ({ user }: { user: UserData | null }) => {
    const router = useRouter();
    const [usage, setUsage] = useState({ words: 0, documents: 0 });
    const [isOpen, setIsOpen] = useState(false);

    const isPremium = user?.isPremium || false;
    const limits = { words: 1000, documents: 3 };

    const wordPercentage = isPremium ? 100 : (usage.words / limits.words) * 100;
    const docPercentage = isPremium ? 100 : (usage.documents / limits.documents) * 100;
    
    if (!user) return null;

    if (!isOpen) {
        return (
            <div className="flex justify-end p-4 border-t">
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} title="Show daily usage">
                    <Gauge className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">Daily Usage ({isPremium ? 'Premium Plan' : 'Free Plan'})</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-7 w-7">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="space-y-3">
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>AI Words</span>
                        <span>{isPremium ? 'Unlimited' : `${usage.words.toLocaleString()} / ${limits.words.toLocaleString()}`}</span>
                    </div>
                    <Progress value={wordPercentage} />
                </div>
                 <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Documents</span>
                        <span>{isPremium ? 'Unlimited' : `${usage.documents} / ${limits.documents}`}</span>
                    </div>
                    <Progress value={docPercentage} />
                </div>
                {!isPremium && (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/dashboard/upgrade')}>
                        Upgrade for Unlimited Usage
                    </Button>
                )}
            </div>
        </div>
    );
};


interface ControlPanelProps {
    user: UserData | null;
    setContent: React.Dispatch<React.SetStateAction<DocumentContent>>;
    setReferences: React.Dispatch<React.SetStateAction<References>>;
    styles: StyleOptions;
    setStyles: React.Dispatch<React.SetStateAction<StyleOptions>>;
    references: References;
    content: DocumentContent;
    customTemplate: string;
    setCustomTemplate: React.Dispatch<React.SetStateAction<string>>;
    isTemplateMode: boolean;
    setIsTemplateMode: React.Dispatch<React.SetStateAction<boolean>>;
}


export function ControlPanel({
  user,
  setContent,
  setReferences,
  styles,
  setStyles,
  references,
  content,
  customTemplate,
  setCustomTemplate,
  isTemplateMode,
  setIsTemplateMode
}: ControlPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>({ projects: [], standaloneDocuments: [], archivedItems: [], sharedDocuments: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [newTaskLocation, setNewTaskLocation] = useState<string>('standalone');
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{id: string, name: string, type: 'project' | 'document', projectId?: string} | null>(null);
  const [newName, setNewName] = useState('');

  const { toast } = useToast();
  
  const generationForm = useForm<GenerationFormValues>({
    resolver: zodResolver(GenerationSchema),
    defaultValues: { topic: '', parameters: '', taskType: 'Research Paper', numPages: 1 },
  });



  const taskType = generationForm.watch('taskType');
  
  const handleTaskTypeChange = (newTaskType: AcademicTaskType) => {
    generationForm.setValue('taskType', newTaskType);
    
    const isDefaultTitle = content.title.includes("Your Academic Paper Title") || 
                           content.title.includes("New Research Paper Title") || 
                           content.title.includes("New Assignment Title") || 
                           content.title.includes('New ');
                           
    if (newTaskType === 'Custom') {
        setContent({ title: 'New Custom Document', sections: [] });
        return;
    }
                           
    const format = academicTaskFormats[newTaskType];
    const sections = format
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('- '))
      .map(line => ({
        title: line.substring(2).trim(),
        content: [],
      }));
    
    const newContent: DocumentContent = {
      title: isDefaultTitle ? `New ${newTaskType} Title` : content.title,
      sections,
    };

    setContent(newContent);
  };
  
  useEffect(() => {
    async function loadWorkspace() {
        if (!user) return;
        const workspaceRef = doc(db, 'workspaces', user.uid);
        const workspaceSnap = await getDoc(workspaceRef);

        if (workspaceSnap.exists()) {
            const workspaceData = workspaceSnap.data() as Workspace;
            // Ensure all arrays exist
            workspaceData.projects = workspaceData.projects || [];
            workspaceData.standaloneDocuments = workspaceData.standaloneDocuments || [];
            workspaceData.archivedItems = workspaceData.archivedItems || [];
            workspaceData.sharedDocuments = workspaceData.sharedDocuments || [];
            
            setWorkspace(workspaceData);
            setExpandedProjects(workspaceData.projects.filter(p => p.documents.length > 0).map(p => p.id));
        } else {
            // No workspace exists for this user yet, use the initial empty state.
            setWorkspace({ projects: [], standaloneDocuments: [], archivedItems: [], sharedDocuments: [] });
        }
    }
    loadWorkspace();
  }, [user]);

  const saveWorkspace = async (newWorkspace: Workspace) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not signed in', description: 'Cannot save workspace.'});
        return;
    }
    try {
        setWorkspace(newWorkspace);
        const workspaceRef = doc(db, 'workspaces', user.uid);
        await setDoc(workspaceRef, newWorkspace, { merge: true });
    } catch (error) {
        console.error("Failed to save workspace to Firestore", error);
        toast({ variant: 'destructive', title: 'Save failed', description: 'Could not save your workspace.'});
    }
  }
  

  const filteredWorkspace = useMemo(() => {
    if (!searchQuery) return workspace;
    const lowercasedQuery = searchQuery.toLowerCase();

    const filteredProjects = workspace.projects.map(project => {
        const filteredDocs = project.documents.filter(doc => doc.title.toLowerCase().includes(lowercasedQuery));
        if (project.name.toLowerCase().includes(lowercasedQuery) || filteredDocs.length > 0) {
            return {...project, documents: filteredDocs.length > 0 ? filteredDocs : project.documents};
        }
        return null;
    }).filter((p): p is Project => p !== null);

    const filteredStandaloneDocs = workspace.standaloneDocuments.filter(doc => doc.title.toLowerCase().includes(lowercasedQuery));
    
    return {
        ...workspace,
        projects: filteredProjects,
        standaloneDocuments: filteredStandaloneDocs,
    };
}, [workspace, searchQuery]);

  const saveDocument = (documentContent: DocumentContent, documentReferences: References) => {
    if (!documentContent.title || documentContent.title.includes('New Research Paper Title')) return;
    
    const newDoc: DocumentItem = {
      id: new Date().toISOString(),
      title: documentContent.title,
      content: documentContent,
      references: documentReferences,
      timestamp: new Date().toLocaleString(),
    };
    
    const newWorkspace = {...workspace};
    // Simple approach: Add as a standalone doc for now. Moving docs can be a future feature.
    const existingIndex = newWorkspace.standaloneDocuments.findIndex(doc => doc.title === newDoc.title);
    if(existingIndex > -1) {
        newWorkspace.standaloneDocuments[existingIndex] = newDoc;
    } else {
        newWorkspace.standaloneDocuments = [newDoc, ...newWorkspace.standaloneDocuments];
    }
    saveWorkspace(newWorkspace);
  };

  const loadDocument = (item: DocumentItem) => {
    setContent(item.content);
    setReferences(item.references);
    generationForm.setValue('topic', item.content.title);
    if(item.content.title) {
        const taskTypeGuess = Object.keys(academicTaskFormats).find(t => item.content.title.toLowerCase().includes(t.toLowerCase())) as AcademicTaskType | undefined;
        generationForm.setValue('taskType', taskTypeGuess || 'Research Paper');
    }
    toast({
      title: 'Loaded from Projects',
      description: `Loaded document "${item.title}".`,
    });
  };

  const deleteDocument = (id: string, projectId?: string) => {
    let newWorkspace = {...workspace};
    if (projectId) {
        newWorkspace.projects = newWorkspace.projects.map(p => 
            p.id === projectId ? {...p, documents: p.documents.filter(d => d.id !== id)} : p
        );
    } else {
        newWorkspace.standaloneDocuments = newWorkspace.standaloneDocuments.filter(d => d.id !== id);
    }
    saveWorkspace(newWorkspace);
    toast({ title: 'Document Deleted' });
  };
  
  const deleteProject = (id: string) => {
    let newWorkspace = {...workspace, projects: workspace.projects.filter(p => p.id !== id)};
    saveWorkspace(newWorkspace);
    toast({ variant: 'destructive', title: 'Project Deleted' });
  }

  const archiveDocument = (id: string, projectId?: string) => {
    let newWorkspace = { ...workspace };
    let docToArchive: DocumentItem | undefined;

    if (projectId) {
        const project = newWorkspace.projects.find(p => p.id === projectId);
        docToArchive = project?.documents.find(d => d.id === id);
        if (docToArchive) {
            newWorkspace.projects = newWorkspace.projects.map(p => 
                p.id === projectId ? { ...p, documents: p.documents.filter(d => d.id !== id) } : p
            );
        }
    } else {
        docToArchive = newWorkspace.standaloneDocuments.find(d => d.id === id);
        if (docToArchive) {
            newWorkspace.standaloneDocuments = newWorkspace.standaloneDocuments.filter(d => d.id !== id);
        }
    }

    if (docToArchive) {
        newWorkspace.archivedItems = [...newWorkspace.archivedItems, { ...docToArchive, itemType: 'document' }];
        saveWorkspace(newWorkspace);
        toast({ title: 'Document Archived' });
    }
  };

  const archiveProject = (id: string) => {
      let newWorkspace = { ...workspace };
      const projectToArchive = newWorkspace.projects.find(p => p.id === id);

      if (projectToArchive) {
          newWorkspace.projects = newWorkspace.projects.filter(p => p.id !== id);
          newWorkspace.archivedItems = [...newWorkspace.archivedItems, { ...projectToArchive, itemType: 'project' }];
          saveWorkspace(newWorkspace);
          toast({ title: 'Project Archived' });
      }
  };

  const shareDocument = (docId: string, projectId?: string) => {
    const newWorkspace = { ...workspace };
    let docToShare: DocumentItem | undefined;

    const findDoc = (docs: DocumentItem[]) => docs.find(d => d.id === docId);

    if (projectId) {
      const project = newWorkspace.projects.find(p => p.id === projectId);
      docToShare = findDoc(project?.documents || []);
    } else {
      docToShare = findDoc(newWorkspace.standaloneDocuments);
    }

    if (!docToShare) return;

    const publicId = docToShare.publicId || `${docId.substring(0, 8)}-${Date.now().toString(36)}`;
    
    // Update the document item to mark it as shared
    const updateDoc = (doc: DocumentItem) => 
        doc.id === docId ? { ...doc, isShared: true, publicId } : doc;

    if (projectId) {
        newWorkspace.projects = newWorkspace.projects.map(p => 
            p.id === projectId ? { ...p, documents: p.documents.map(updateDoc) } : p
        );
    } else {
        newWorkspace.standaloneDocuments = newWorkspace.standaloneDocuments.map(updateDoc);
    }
    
    // Add to shared documents list if not already there
    if (!newWorkspace.sharedDocuments.some(d => d.id === docId)) {
        newWorkspace.sharedDocuments.push({ ...docToShare, publicId, sharedAt: new Date().toISOString(), title: docToShare.title });
    }

    saveWorkspace(newWorkspace);
    
    const shareUrl = `${window.location.origin}/share/${publicId}`;
    navigator.clipboard.writeText(shareUrl);

    toast({
        title: 'Share Link Copied!',
        description: 'A public link to your document has been copied to your clipboard.',
    });
  };


  const handleNewProject = () => {
    const projectName = prompt("Enter the name for your new project folder:");
    if (projectName) {
      const newProject: Project = {
        id: new Date().toISOString(),
        name: projectName,
        documents: [],
        timestamp: new Date().toLocaleString(),
      };
      const newWorkspace = { ...workspace, projects: [newProject, ...workspace.projects] };
      saveWorkspace(newWorkspace);
      toast({ title: 'Project Created', description: `Folder "${projectName}" has been added.`});
    }
  }

  const createNewDocument = (location: string) => {
    const defaultTask: AcademicTaskType = 'Research Paper';
    const format = academicTaskFormats[defaultTask];
      const sections = format
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => ({
          title: line.substring(2).trim(),
          content: [],
        }));
    
    const newDocContent: DocumentContent = {
        title: `New ${defaultTask} - ${new Date().toLocaleTimeString()}`,
        sections,
    };
    const newDocItem: DocumentItem = {
        id: new Date().toISOString(),
        title: newDocContent.title,
        content: newDocContent,
        references: [],
        timestamp: new Date().toLocaleString()
    }

    let newWorkspace = {...workspace};
    if (location === 'standalone') {
        newWorkspace.standaloneDocuments = [newDocItem, ...newWorkspace.standaloneDocuments];
    } else {
        newWorkspace.projects = newWorkspace.projects.map(p => {
            if (p.id === location) {
                return {...p, documents: [newDocItem, ...p.documents]};
            }
            return p;
        });
        // Expand the project where the new doc was added
        if (!expandedProjects.includes(location)) {
          setExpandedProjects(prev => [...prev, location]);
        }
    }
    saveWorkspace(newWorkspace);
    loadDocument(newDocItem);
    toast({
        title: 'New Task Started',
        description: `Created new document in ${location === 'standalone' ? 'Standalone Files' : newWorkspace.projects.find(p => p.id === location)?.name}.`,
    });
  }

  const handleConfirmNewTask = () => {
    createNewDocument(newTaskLocation);
    setIsNewTaskDialogOpen(false); // Close dialog after confirming
  }
  
  const handleRename = () => {
    if (!itemToRename || !newName) return;
    
    let newWorkspace = {...workspace};
    if(itemToRename.type === 'project') {
      newWorkspace.projects = newWorkspace.projects.map(p => 
        p.id === itemToRename.id ? {...p, name: newName} : p
      );
    } else { // type === 'document'
      if (itemToRename.projectId) {
        newWorkspace.projects = newWorkspace.projects.map(p => 
            p.id === itemToRename.projectId ? {...p, documents: p.documents.map(d => d.id === itemToRename.id ? {...d, title: newName, content: {...d.content, title: newName}} : d) } : p
        );
      } else {
        newWorkspace.standaloneDocuments = newWorkspace.standaloneDocuments.map(d => d.id === itemToRename.id ? {...d, title: newName, content: {...d.content, title: newName}} : d);
      }
      // If the renamed document is the one currently being edited, update the editor title as well.
      if (content.title === itemToRename.name) {
          setContent({...content, title: newName});
      }
    }
    
    saveWorkspace(newWorkspace);
    toast({ title: 'Item Renamed' });
    setIsRenameDialogOpen(false);
    setItemToRename(null);
    setNewName('');
  }

  const openRenameDialog = (item: {id: string, name: string, type: 'project' | 'document', projectId?: string}) => {
    setItemToRename(item);
    setNewName(item.name);
    setIsRenameDialogOpen(true);
  }

  const moveDocument = (docId: string, targetProjectId: string) => {
    let newWorkspace = { ...workspace };
    const docToMove = newWorkspace.standaloneDocuments.find(d => d.id === docId);

    if (!docToMove) return;

    // Remove from standalone
    newWorkspace.standaloneDocuments = newWorkspace.standaloneDocuments.filter(d => d.id !== docId);

    // Add to target project
    newWorkspace.projects = newWorkspace.projects.map(p => {
        if (p.id === targetProjectId) {
            return { ...p, documents: [docToMove, ...p.documents] };
        }
        return p;
    });

    saveWorkspace(newWorkspace);
    toast({ title: 'Document Moved', description: `Moved "${docToMove.title}" to project.` });
  };


  async function onGenerate(values: GenerationFormValues) {
    setIsGenerating(true);
    toast({
      title: 'Generating Content...',
      description: 'The AI is crafting your document. This may take a moment.',
    });

    const valuesToSubmit = {
        ...values,
        customTemplate: isTemplateMode ? customTemplate : undefined,
    }

    const { data, error } = await generateContentAction(valuesToSubmit);

    setIsGenerating(false);

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error,
      });
    } else {
      setContent(data.content);
      setReferences(data.references);
      saveDocument(data.content, data.references);
      toast({
        title: 'Content Generated',
        description: 'Your document has been created and saved to your projects.',
      });
    }
  }


  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <MountainIcon className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold">AZMA AI</h1>
      </div>

      <div className="p-4 space-y-2 border-b">
        <div className="flex gap-2">
            <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                    <PlusCircle /> New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                      <DialogDescription>
                          Choose where to create your new document.
                      </DialogDescription>
                  </DialogHeader>
                  <RadioGroup defaultValue="standalone" onValueChange={setNewTaskLocation}>
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="standalone" id="r-standalone" />
                          <Label htmlFor="r-standalone">Create as a standalone file</Label>
                      </div>
                      <Separator className="my-2" />
                      <p className="text-sm font-medium text-muted-foreground">Or add to a project:</p>
                      {workspace.projects.length > 0 ? workspace.projects.map(p => (
                         <div key={p.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={p.id} id={`r-${p.id}`} />
                            <Label htmlFor={`r-${p.id}`}>{p.name}</Label>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">No projects created yet.</p>
                      )}
                  </RadioGroup>
                  <div className="flex justify-end gap-2 mt-4">
                      <DialogClose asChild>
                          <Button variant="ghost">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleConfirmNewTask}>Create Document</Button>
                  </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="flex-1" onClick={handleNewProject}>
                <FolderPlus /> Add Project
            </Button>
        </div>
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                type="search"
                placeholder="Search projects..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>
      
      <Tabs defaultValue="projects" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-4">
            <TabsTrigger value="projects" className="flex-1"><Library className="mr-2"/>Projects</TabsTrigger>
            <TabsTrigger value="edit" className="flex-1"><Sparkles className="mr-2"/>Generate &amp; Edit</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="flex-1 overflow-auto">
            <ScrollArea className="h-full">
                <div className="p-4 space-y-1">
                    {filteredWorkspace.projects.map(project => (
                        <Collapsible 
                          key={project.id}
                          open={expandedProjects.includes(project.id)}
                          onOpenChange={(isOpen) => {
                            setExpandedProjects(prev => isOpen ? [...prev, project.id] : prev.filter(id => id !== project.id))
                          }}
                          className="space-y-2"
                        >
                            <div className="flex justify-between items-center group pr-2">
                                <CollapsibleTrigger className="flex items-center gap-2 font-semibold text-left flex-1 py-1 group/trigger">
                                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=closed]/trigger:-rotate-90" />
                                    <Folder className="h-5 w-5 text-primary" />
                                    <span>{project.name}</span>
                                </CollapsibleTrigger>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                          <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openRenameDialog({id: project.id, name: project.name, type: 'project'})}>
                                          <Edit className="mr-2 h-4 w-4"/> Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => archiveProject(project.id)}>
                                        <Archive className="mr-2 h-4 w-4" /> Archive
                                      </DropdownMenuItem>
                                      <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                  <Trash2 className="mr-2 h-4 w-4"/> Delete
                                              </DropdownMenuItem>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                              <AlertDialogHeader>
                                              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                  This will delete the project and all documents inside it. This action cannot be undone.
                                              </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => deleteProject(project.id)}>Delete</AlertDialogAction>
                                              </AlertDialogFooter>
                                          </AlertDialogContent>
                                      </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <CollapsibleContent className="pl-4 border-l-2 border-muted ml-4 space-y-1">
                                {project.documents.length > 0 ? project.documents.map(doc => (
                                    <div key={doc.id} className="flex justify-between items-center group pl-2">
                                        <button onClick={() => loadDocument(doc)} className="flex items-center gap-2 text-left flex-1 py-1">
                                            <File className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm truncate">{doc.title}</span>
                                        </button>
                                          <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                  <DropdownMenuItem onClick={() => openRenameDialog({id: doc.id, name: doc.title, type: 'document', projectId: project.id})}>
                                                      <Edit className="mr-2 h-4 w-4"/> Rename
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => shareDocument(doc.id, project.id)}>
                                                      <Share2 className="mr-2 h-4 w-4" /> Share
                                                  </DropdownMenuItem>
                                                   <DropdownMenuItem onClick={() => archiveDocument(doc.id, project.id)}>
                                                        <Archive className="mr-2 h-4 w-4" /> Archive
                                                    </DropdownMenuItem>
                                                  <AlertDialog>
                                                      <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                        </DropdownMenuItem>
                                                      </AlertDialogTrigger>
                                                      <AlertDialogContent>
                                                          <AlertDialogHeader>
                                                          <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                                                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                          </AlertDialogHeader>
                                                          <AlertDialogFooter>
                                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                          <AlertDialogAction onClick={() => deleteDocument(doc.id, project.id)}>Delete</AlertDialogAction>
                                                          </AlertDialogFooter>
                                                      </AlertDialogContent>
                                                  </AlertDialog>
                                              </DropdownMenuContent>
                                          </DropdownMenu>
                                    </div>
                                )) : <p className="text-xs text-muted-foreground pl-4 py-1">No documents in this project.</p>}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}

                    {(filteredWorkspace.projects.length > 0 && filteredWorkspace.standaloneDocuments.length > 0) && <Separator />}
                    
                    <div className="space-y-1">
                         {filteredWorkspace.standaloneDocuments.map(doc => (
                            <div key={doc.id} className="flex justify-between items-center group pr-2">
                                <button onClick={() => loadDocument(doc)} className="flex items-center gap-2 text-left flex-1 py-1">
                                    <File className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium text-sm truncate">{doc.title}</span>
                                </button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                          <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openRenameDialog({id: doc.id, name: doc.title, type: 'document'})}>
                                            <Edit className="mr-2 h-4 w-4"/> Rename
                                        </DropdownMenuItem>
                                         <DropdownMenuItem onClick={() => shareDocument(doc.id)}>
                                            <Share2 className="mr-2 h-4 w-4" /> Share
                                        </DropdownMenuItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <FolderInput className="mr-2 h-4 w-4"/>
                                                <span>Move to Project</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    {workspace.projects.length > 0 ? workspace.projects.map(p => (
                                                        <DropdownMenuItem key={p.id} onClick={() => moveDocument(doc.id, p.id)}>
                                                            <Folder className="mr-2 h-4 w-4"/>
                                                            <span>{p.name}</span>
                                                        </DropdownMenuItem>
                                                    )) : (
                                                        <DropdownMenuItem disabled>No projects</DropdownMenuItem>
                                                    )}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                        <DropdownMenuItem onClick={() => archiveDocument(doc.id)}>
                                            <Archive className="mr-2 h-4 w-4" /> Archive
                                        </DropdownMenuItem>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                  <Trash2 className="mr-2 h-4 w-4"/> Delete
                                              </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteDocument(doc.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                         ))}
                    </div>

                    {filteredWorkspace.projects.length === 0 && filteredWorkspace.standaloneDocuments.length === 0 && (
                         <div className="text-center text-sm text-muted-foreground p-8">
                            <Library className="mx-auto h-10 w-10 mb-2" />
                            <p className="font-semibold">No Projects Yet</p>
                            <p>Your generated documents will appear here.</p>
                        </div>
                    )}
                </div>
              </ScrollArea>
        </TabsContent>
        <TabsContent value="edit" className="flex-1 overflow-auto">
            <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                    {/* Generate Content Form */}
                    <Form {...generationForm}>
                        <form
                        onSubmit={generationForm.handleSubmit(onGenerate)}
                        className="space-y-4"
                        >
                        <h3 className="text-base font-semibold">Generate Content</h3>
                        <FormField
                            control={generationForm.control}
                            name="taskType"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Task Type</FormLabel>
                                <Select onValueChange={(value) => handleTaskTypeChange(value as AcademicTaskType)} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select a task type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {academicTaskTypes.map(task => (
                                        <SelectItem key={task} value={task}>{task}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={generationForm.control}
                            name="topic"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Topic / Questions</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="e.g., The Impact of AI on Climate Change, or paste your assignment questions here."
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={generationForm.control}
                            name="numPages"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Number of Pages (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={generationForm.control}
                            name="parameters"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parameters (Optional)</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="e.g., Include sections on methodology, results, and discussion."
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <div className="flex items-center space-x-2">
                            <Switch id="custom-template-switch" checked={isTemplateMode} onCheckedChange={setIsTemplateMode} />
                            <Label htmlFor="custom-template-switch">Use Custom Template</Label>
                        </div>
                        <Button type="submit" disabled={isGenerating} className="w-full">
                            {isGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Generate
                        </Button>
                        </form>
                    </Form>
                    <Separator />
                    {/* Style Customization */}
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold">Customize Style</h3>
                        <div className="space-y-2">
                             <Label>Font Family</Label>
                            <Select
                                value={styles.fontFamily}
                                onValueChange={(value: FontType) => setStyles({ ...styles, fontFamily: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a font" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableFonts.map(font => (
                                        <SelectItem key={font} value={font}>{font}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                            <Label>Font Size</Label>
                            <span>{styles.fontSize}pt</span>
                            </div>
                            <Slider
                            value={[styles.fontSize]}
                            onValueChange={([val]) =>
                                setStyles({ ...styles, fontSize: val })
                            }
                            min={8} max={24} step={1}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                            <Label>Line Spacing</Label>
                            <span>{styles.lineHeight.toFixed(1)}</span>
                            </div>
                            <Slider
                            value={[styles.lineHeight]}
                            onValueChange={([val]) =>
                                setStyles({ ...styles, lineHeight: val })
                            }
                            min={1} max={2.5} step={0.1}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                            <Label>Margins</Label>
                            <span>{styles.margin.toFixed(2)}cm</span>
                            </div>
                            <Slider
                            value={[styles.margin]}
                            onValueChange={([val]) =>
                                setStyles({ ...styles, margin: val })
                            }
                            min={1} max={4} step={0.01}
                            />
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {itemToRename?.type}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogClose asChild>
            <div className="flex justify-end gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button onClick={handleRename}>Save</Button>
            </div>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <div className="mt-auto">
        <UsageMeter user={user} />
      </div>
    </div>
  );
}
