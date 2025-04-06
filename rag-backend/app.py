#pip install streamlit numpy langchain langchain-core langchain-community langchain-chroma langchain-google-genai google-generativeai

import os
import streamlit as st
import io
import re
import numpy as np
from typing import List, Dict, Any, Tuple, Optional

# Import LangChain components
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, GoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

# Set Google API Key - either from environment variable or hardcode it (not recommended for production)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or "AIzaSyAXzmHm2OTvvjtUmDyQNy-tgDlslaxbOEo"

# Document Processing Class
class DocumentProcessor:
    def _init_(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """Initialize document processor with chunk settings"""
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, 
            chunk_overlap=chunk_overlap
        )
    
    def process_pdf_file(self, uploaded_file) -> List[Document]:
        """Process uploaded PDF file and return chunked documents"""
        # Create a temporary file path
        temp_file_path = f"temp_{uploaded_file.name}"
        
        # Write the uploaded file to a temporary file
        with open(temp_file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        # Use PyPDFLoader to load and process the PDF
        loader = PyPDFLoader(temp_file_path)
        documents = loader.load()
        
        # Clean up the temporary file
        os.remove(temp_file_path)
        
        # Split documents into chunks
        chunked_documents = self.text_splitter.split_documents(documents)
        
        return chunked_documents
    
    def process_text_file(self, uploaded_file) -> List[Document]:
        """Process uploaded text file and return chunked documents"""
        # Read the text content
        text_content = uploaded_file.getvalue().decode("utf-8")
        
        # Create a Document object
        doc = Document(page_content=text_content, metadata={"source": uploaded_file.name})
        
        # Split into chunks
        chunked_documents = self.text_splitter.split_documents([doc])
        
        return chunked_documents
    
    def process_uploaded_file(self, uploaded_file) -> List[Document]:
        """Process an uploaded file based on its type"""
        if uploaded_file.name.lower().endswith('.pdf'):
            return self.process_pdf_file(uploaded_file)
        elif uploaded_file.name.lower().endswith(('.txt', '.md', '.csv')):
            return self.process_text_file(uploaded_file)
        else:
            raise ValueError(f"Unsupported file type: {uploaded_file.name}")

# RAG System Class
class RAGSystem:
    def _init_(self, api_key: str = "AIzaSyAXzmHm2OTvvjtUmDyQNy-tgDlslaxbOEo", 
                 embedding_model: str = 'models/embedding-001', 
                 llm_model: str = 'gemini-1.5-pro'):
        """Initialize the RAG system with models and API key"""
        self.api_key = api_key
        self.embedding_model_name = embedding_model
        self.llm_model_name = llm_model
        self.vectorstore = None
        self.retriever = None
        self.llm = None
        self.rag_chain = None
        
        # Initialize embedding model
        self.embedding_model = GoogleGenerativeAIEmbeddings(
            model=embedding_model,
            google_api_key=api_key
        )
    
    def create_vectorstore(self, documents: List[Document]) -> None:
        """Create vector store from documents"""
        # Create a persistent vector store with a unique name
        persist_directory = "chroma_db"
        
        # Initialize the vector store
        self.vectorstore = Chroma.from_documents(
            documents=documents,
            embedding=self.embedding_model,
            persist_directory=persist_directory
        )
        
        # Persist the vector store to disk
        self.vectorstore.persist()
    
    def setup_rag_chain(self, k: int = 5, temperature: float = 0.4, max_tokens: int = 500) -> None:
        """Set up the RAG chain with retriever and LLM"""
        if not self.vectorstore:
            raise ValueError("Vector store not initialized. Please create vector store first.")
        
        # Create retriever
        self.retriever = self.vectorstore.as_retriever(
            search_type='similarity', 
            search_kwargs={'k': k}
        )
        
        # Set up LLM
        self.llm = GoogleGenerativeAI(
            model=self.llm_model_name,
            google_api_key=self.api_key,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # Create prompt template
        system_prompt = (
            "You are an assistant for question-answering tasks. "
            "Use the following pieces of retrieved context to answer the question. "
            "If you don't know the answer, say you don't know. "
            "Keep your answers factual and based only on the provided context.\n\n{context}"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}")
        ])
        
        # Create question answering chain
        question_answer_chain = create_stuff_documents_chain(self.llm, prompt)
        
        # Create retrieval chain
        self.rag_chain = create_retrieval_chain(self.retriever, question_answer_chain)
    
    def query(self, question: str) -> Dict[str, Any]:
        """Query the RAG system with a question"""
        if not self.rag_chain:
            raise ValueError("RAG chain not initialized. Please set up RAG chain first.")
        
        response = self.rag_chain.invoke({"input": question})
        return response

# Streamlit UI
def main():
    st.set_page_config(page_title="VOX-Ai qna system", layout="centered")
    st.title("VOX-Ai qna system")
    
    # Initialize session state
    if "initialized" not in st.session_state:
        st.session_state.rag_system = None
        st.session_state.processed_files = []
        st.session_state.documents = []
        st.session_state.messages = []
        st.session_state.initialized = True
    
    # Sidebar for document upload and processing
    with st.sidebar:
        st.header("Upload and Process Documents")
        
        api_key = st.text_input("Google API Key", value=GOOGLE_API_KEY, type="password")
        
        uploaded_file = st.file_uploader("Upload Document", type=["pdf", "txt", "md", "csv"])
        
        chunk_size = st.slider("Chunk Size", min_value=100, max_value=2000, value=1000, step=100)
        chunk_overlap = st.slider("Chunk Overlap", min_value=0, max_value=500, value=200, step=50)
        
        k_value = st.slider("Number of Relevant Chunks", min_value=1, max_value=20, value=5)
        temperature = st.slider("Temperature", min_value=0.0, max_value=1.0, value=0.4, step=0.1)
        
        process_button = st.button("Process Document")
        
        if process_button and uploaded_file is not None:
            with st.spinner("Processing document..."):
                try:
                    # Initialize document processor
                    processor = DocumentProcessor(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
                    
                    # Process uploaded file
                    new_documents = processor.process_uploaded_file(uploaded_file)
                    
                    # Add to existing documents
                    st.session_state.documents.extend(new_documents)
                    st.session_state.processed_files.append(uploaded_file.name)
                    
                    # Initialize RAG system with the API key
                    st.session_state.rag_system = RAGSystem(api_key=api_key)
                    
                    # Create vector store
                    st.session_state.rag_system.create_vectorstore(st.session_state.documents)
                    
                    # Set up RAG chain
                    st.session_state.rag_system.setup_rag_chain(k=k_value, temperature=temperature)
                    
                    st.success(f"Processed {len(new_documents)} chunks from {uploaded_file.name}")
                    
                except Exception as e:
                    st.error(f"Error processing document: {str(e)}")
        
        # Display processed files
        if st.session_state.processed_files:
            st.subheader("Processed Files:")
            for file in st.session_state.processed_files:
                st.write(f"- {file}")
            
            st.write(f"Total chunks: {len(st.session_state.documents)}")
            
            # Option to clear all documents
            if st.button("Clear All Documents"):
                # Clean up the persistent vector store
                import shutil
                if os.path.exists("chroma_db"):
                    shutil.rmtree("chroma_db")
                
                st.session_state.rag_system = None
                st.session_state.documents = []
                st.session_state.processed_files = []
                st.session_state.messages = []
                st.success("All documents cleared")
    
    # Main area for chat interface
    st.header("Ask Questions from your meeting knowledgeHUB")
    
    if not st.session_state.rag_system:
        st.info("Please upload and process a document to start asking questions.")
    else:
        # Display chat history
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])
        
        # User input
        user_question = st.chat_input("Ask a question about your documents...")
        
        if user_question:
            # Add user message to chat history
            st.session_state.messages.append({"role": "user", "content": user_question})
            
            # Display user message
            with st.chat_message("user"):
                st.markdown(user_question)
            
            # Generate and display assistant response
            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    try:
                        # Ensure the RAG chain is set up properly
                        if st.session_state.rag_system.rag_chain is None:
                            # If the chain was lost (e.g., due to session refresh), recreate it
                            st.session_state.rag_system.setup_rag_chain()
                        
                        response = st.session_state.rag_system.query(user_question)
                        answer = response["answer"]
                        st.markdown(answer)
                        
                        # Add assistant message to chat history
                        st.session_state.messages.append({"role": "assistant", "content": answer})
                        
                    except Exception as e:
                        error_message = f"Error generating response: {str(e)}"
                        st.error(error_message)
                        st.session_state.messages.append({"role": "assistant", "content": error_message})

if __name__ == "__main__":
    main()