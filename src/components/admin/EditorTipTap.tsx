import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Code,
  Quote,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface EditorTipTapProps {
  content: string;
  onChange: (content: string) => void;
}

const EditorTipTap = ({ content, onChange }: EditorTipTapProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      Placeholder.configure({
        placeholder: "Escribe el contenido de tu artículo aquí...",
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  const addImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `blog/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from("class-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("class-images")
          .getPublicUrl(filePath);

        editor?.chain().focus().setImage({ src: publicUrl }).run();
        toast({ title: "Imagen agregada", description: "La imagen se ha insertado correctamente." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const addYoutube = () => {
    const url = prompt("Ingresa la URL de YouTube:");
    if (url) {
      editor?.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = prompt("Ingresa la URL del enlace:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  const ToolbarButton = ({ onClick, isActive, disabled, children, title }: any) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className="border rounded-md">
      <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/20">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Tachado"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Título H1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Título H2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Lista"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Cita"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Código"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton onClick={addLink} title="Agregar enlace">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} disabled={uploading} title="Agregar imagen">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addYoutube} title="Agregar YouTube">
          <YoutubeIcon className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Deshacer">
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Rehacer">
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default EditorTipTap;
