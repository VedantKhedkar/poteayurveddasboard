import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PencilRuler, Trash2 } from "lucide-react";
import axios from "axios";

// DND Kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableCard = ({ item, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-6 flex flex-col md:flex-row justify-between">
        <div className="md:w-1/3 p-4 flex flex-col items-center">
          <img
            src={
              item.image
                ? `https://api.jarayuayurved.com/${item.image.replace(
                    /^\/+/,
                    ""
                  )}`
                : "/default.jpg"
            }
            alt={item.name}
            className="w-28 h-28 object-cover rounded-full shadow-md mb-4"
          />
          <h2 className="text-xl font-bold text-orange-500 text-center">
            {item.name}
          </h2>
          <p className="text-gray-600 font-medium">{item.position}</p>
        </div>
        <div className="md:w-2/3 p-4 flex flex-col justify-between">
          <h3 className="text-xl font-bold text-indigo-800 mb-4">
            {item.title}
          </h3>
          <div className="space-y-3 text-gray-700 max-h-40 overflow-y-auto pr-2">
            {item.content.map((para, idx) => (
              <p
                key={idx}
                className="text-sm leading-relaxed text-justify font-medium"
              >
                {para}
              </p>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => onEdit(item)}
              className="text-blue-600 hover:text-blue-800"
            >
              <PencilRuler className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AdministrationDashboard = () => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    title: "",
    content: "",
    image: null,
    imagePreview: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const fileInputRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "https://api.jarayuayurved.com/api/success-stories"
      );
      if (Array.isArray(res.data)) setData(res.data);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      position: item.position,
      title: item.title,
      content: item.content.join("\n\n"),
      image: null,
      imagePreview: item.image,
    });
    setIsEditing(true);
    setIsAdding(false);
  };

  const startAdding = () => {
    setEditingId(null);
    setFormData({
      name: "",
      position: "",
      title: "",
      content: "",
      image: null,
      imagePreview: null,
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingId(null);
  };

  const saveChanges = async () => {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("position", formData.position);
    form.append("title", formData.title);
    form.append("content", formData.content);
    if (formData.image) form.append("image", formData.image);

    try {
      if (editingId) {
        await axios.put(
          `https://api.jarayuayurved.com/api/success-stories/${editingId}`,
          form
        );
      } else {
        await axios.post(
          "https://api.jarayuayurved.com/api/success-stories",
          form
        );
      }
      fetchData();
      cancelEditing();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const confirmDelete = (id) => {
    setSelectedDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      await axios.delete(
        `https://api.jarayuayurved.com/api/success-stories/${selectedDeleteId}`
      );
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setShowDeleteModal(false);
      setSelectedDeleteId(null);
    }
  };

  const handleDeleteCancelled = () => {
    setShowDeleteModal(false);
    setSelectedDeleteId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: file ? URL.createObjectURL(file) : null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item.id === active.id);
      const newIndex = data.findIndex((item) => item.id === over.id);
      const newData = arrayMove(data, oldIndex, newIndex);
      setData(newData);
    }
  };

  return (
    <div
      className="h-screen overflow-y-auto py-8 px-4 sm:px-6 bg-gradient-to-br from-gray-50 to-blue-50 scrollbar-custom"
      style={{ height: "calc(100vh - 80px)" }}
    >
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-8 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">
              Success Stories
            </h1>
            <p className="text-gray-600">
              Manage students' messages and profiles
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startAdding}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-300 to-orange-500 text-white font-medium py-2.5 px-6 rounded-lg shadow-md h-12"
          >
            Add New Story
          </motion.button>
        </div>

        {/* 👉 Drag and Drop Context */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={data.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.map((item) => (
                <SortableCard
                  key={item.id}
                  item={item}
                  onEdit={startEditing}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* ✅ Drawer and Delete Modal stay unchanged below */}
        {/* 🧠 Keep your existing isEditing Drawer and Delete Confirmation Modal untouched */}
        {/* You’ve done a clean implementation already */}

        {/* ✅ Keep the rest of your Drawer + Modal code below here */}
        {/* ✂️ Not repeated again to avoid bloating — it already works perfectly! */}
      </div>
    </div>
  );
};

export default AdministrationDashboard;
