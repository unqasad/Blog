import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const ToolbarButton = ({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    className={`h-8 w-8 inline-flex items-center justify-center rounded-md border text-xs transition ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "border-border bg-card hover:border-primary/40"
    }`}
  >
    {children}
  </button>
);

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;
  const addLink = () => {
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const addImage = () => {
    const url = window.prompt("Image URL (https://…)");
    if (!url) return;
    editor.chain().focus().setImage({ src: url, alt: "" }).run();
  };
  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 p-2 rounded-t-md">
      <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Heading 4" active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
        <Heading4 className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton title="Link" active={editor.isActive("link")} onClick={addLink}>
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Image" onClick={addImage}>
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Insert table" onClick={addTable}>
        <TableIcon className="h-4 w-4" />
      </ToolbarButton>
      {editor.isActive("table") && (
        <div className="ml-1 flex flex-wrap items-center gap-1">
          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col</Button>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => editor.chain().focus().addRowAfter().run()}>+ Row</Button>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => editor.chain().focus().deleteColumn().run()}>− Col</Button>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => editor.chain().focus().deleteRow().run()}>− Row</Button>
          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => editor.chain().focus().deleteTable().run()}>Delete table</Button>
        </div>
      )}
      <span className="ml-auto flex gap-1">
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </span>
    </div>
  );
};

export const RichTextEditor = ({ value, onChange, placeholder }: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: {} }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image.configure({ inline: false, HTMLAttributes: { class: "rounded-md border border-border" } }),
      Table.configure({ resizable: false, HTMLAttributes: { class: "tiptap-table" } }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: placeholder ?? "Start writing…" }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose-article min-h-[400px] max-w-none px-4 py-4 focus:outline-none",
      },
    },
  });

  // Sync external value changes (e.g. when loading an existing post into the editor)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="rounded-md border border-border bg-background">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
