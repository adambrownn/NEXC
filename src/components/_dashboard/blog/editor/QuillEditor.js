import PropTypes from 'prop-types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { styled } from '@mui/material/styles';
import { Box, Button, Divider } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';

const RootStyle = styled('div')(({ theme }) => ({
  border: `solid 1px ${theme.palette.grey[500_32]}`,
  borderRadius: theme.shape.borderRadius,
  '& .ProseMirror': {
    minHeight: 200,
    padding: theme.spacing(2),
    '&:focus': {
      outline: 'none'
    },
    '& p': {
      margin: 0
    }
  }
}));

const MenuButton = styled(Button)(({ theme }) => ({
  minWidth: 40,
  padding: theme.spacing(1),
  color: theme.palette.text.primary,
  '&.active': {
    backgroundColor: theme.palette.action.selected
  }
}));

const MenuBar = ({ editor, onImageUpload }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    if (onImageUpload) {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();
      input.onchange = async () => {
        const file = input.files[0];
        const url = await onImageUpload(file);
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      };
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 1 }}>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'active' : ''}
      >
        <FormatBoldIcon />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'active' : ''}
      >
        <FormatItalicIcon />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'active' : ''}
      >
        <FormatListBulletedIcon />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'active' : ''}
      >
        <FormatListNumberedIcon />
      </MenuButton>
      <MenuButton onClick={addImage}>
        <ImageIcon />
      </MenuButton>
      <MenuButton onClick={addLink}>
        <LinkIcon />
      </MenuButton>
    </Box>
  );
};

const QuillEditor = ({ value, onChange, onImageUpload, error, sx }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    }
  });

  return (
    <RootStyle sx={{ ...(error && { border: (theme) => `solid 1px ${theme.palette.error.main}` }), ...sx }}>
      <MenuBar editor={editor} onImageUpload={onImageUpload} />
      <Divider />
      <EditorContent editor={editor} />
    </RootStyle>
  );
};

QuillEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onImageUpload: PropTypes.func,
  error: PropTypes.bool,
  sx: PropTypes.object
};

export default QuillEditor;
