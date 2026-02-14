import './App.css'
import { EditorProvider } from '@/stores/EditorContext.tsx'
import { Editor } from '@/components/editor/Editor.tsx'

function App() {
  return (
    <EditorProvider>
      <Editor />
    </EditorProvider>
  )
}

export default App
