import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import Login from "./Login";
import { ReactComponent as EditIcon } from "./icons/edit-icon-small.svg";
import { ReactComponent as DeleteIcon } from "./icons/delete-icon-small.svg";
import { ReactComponent as CheckmarkIcon } from "./icons/checkmark-icon-small.svg";
import { ReactComponent as AccountIcon } from "./icons/account-icon-small.svg";
import taskButtonImg from "./button-img/newtask-button.png";
import taskzzLogo from "./logo-img/taskzz-logo.svg";
import { getTranslation } from "./translations";

const API_BASE_URL = "https://2502.ict-expert.ch/api";

// Convertit une date JS en chaîne yyyy-mm-dd comprise par l'API
function toDbDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Formatte une date yyyy-mm-dd en version affichage dd.mm.yyyy
function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

// Fenêtre générique pour les confirmations (suppression, etc.)
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, confirmDanger }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ferme la modale quand on appuie sur Échap
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Lance l'action de confirmation puis ferme la fenêtre une fois la promesse résolue
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="task-modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="confirm-modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <p className="confirm-message">{message}</p>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-button modal-button-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`modal-button ${confirmDanger ? "modal-button-danger" : "modal-button-primary"}`}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Please wait..." : confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modale utilisée pour créer ou modifier une liste custom
function ListModal({ isOpen, onClose, onSubmit, initialData, t }) {
  const [listName, setListName] = useState("");
  const [listColor, setListColor] = useState("#0b304f");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [
    "#0b304f", "#804356", "#2563eb", "#059669", 
    "#d97706", "#dc2626", "#7c3aed", "#db2777"
  ];

  const isEditMode = !!initialData?.id;

  // À chaque ouverture, on remplit le formulaire avec les données de la liste
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setListName(initialData.name || "");
        setListColor(initialData.color || "#0b304f");
      } else {
        setListName("");
        setListColor("#0b304f");
      }
    }
  }, [isOpen, initialData]);

  // Ajoute un écouteur clavier pour permettre la fermeture via Échap
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Envoie les données vers le parent (App) qui fera l'appel API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!listName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id,
        name: listName.trim(),
        color: listColor,
      });
      onClose();
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="task-modal" role="dialog" aria-modal="true" aria-labelledby="list-modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="list-modal-title">
            {isEditMode ? t("editList") : t("newList")}
          </h2>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="list-name">
              {t("listName")}
            </label>
            <input
              id="list-name"
              type="text"
              className="form-input"
              placeholder={t("List Name...")}
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("color")}</label>
            <div className="color-picker">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${listColor === color ? "color-option-selected" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setListColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-button modal-button-secondary"
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="modal-button modal-button-primary"
              disabled={!listName.trim() || isSubmitting}
            >
              {isSubmitting ? "..." : isEditMode ? t("save") : t("create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modale de création/édition de tâche
function TaskModal({ isOpen, onClose, onSubmit, initialData, lists, t, readOnly = false }) {
  const todayDb = toDbDate(new Date());
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(todayDb);
  const [priority, setPriority] = useState("medium");
  const [listId, setListId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialData?.id;
  const modalTitle = readOnly ? t("viewTask") : isEditMode ? t("editTask") : t("newTask");

  // Pré-remplit le formulaire selon le mode (édition ou création)
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setDueDate(initialData.due_date || todayDb);
        setPriority(initialData.priority || "medium");
        setListId(initialData.list_id || "");
      } else {
        setTitle("");
        setDescription("");
        setDueDate(todayDb);
        setPriority("medium");
        setListId("");
      }
    }
  }, [isOpen, initialData, todayDb]);

  // Autorise la fermeture via Échap pour rester accessible
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Transmet les valeurs du formulaire au parent
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) {
      onClose();
      return;
    }
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id,
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate,
        priority,
        list_id: listId || null,
        status: "pending",
      });
      onClose();
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="task-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {modalTitle}
          </h2>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              {t("title")}
            </label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder={t("taskPlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus={!readOnly}
              required
              readOnly={readOnly}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              {t("description")}
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              placeholder={t("descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              readOnly={readOnly}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-date">
                {t("dueDate")}
              </label>
              <input
                id="task-date"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                disabled={readOnly}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                {t("priority")}
              </label>
              <select
                id="task-priority"
                className={`form-select${readOnly ? " form-select-readonly" : ""}`}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={readOnly}
              >
                <option value="low">{t("low")}</option>
                <option value="medium">{t("medium")}</option>
                <option value="high">{t("high")}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-list">
              {t("list")}
            </label>
            <select
              id="task-list"
              className={`form-select${readOnly ? " form-select-readonly" : ""}`}
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              disabled={readOnly}
            >
              <option value="">{t("noList")}</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          {readOnly ? (
            <div className="modal-actions">
              <button
                type="button"
                className="modal-button modal-button-primary"
                onClick={onClose}
              >
                {t("close")}
              </button>
            </div>
          ) : (
            <div className="modal-actions">
              <button
                type="button"
                className="modal-button modal-button-secondary"
                onClick={onClose}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="modal-button modal-button-primary"
                disabled={!title.trim() || isSubmitting}
              >
                {isSubmitting ? "..." : isEditMode ? t("save") : t("create")}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function App() {
  // --- Gestion multilingue (FR/EN) ---
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");
  const t = (key) => getTranslation(lang, key);
  
  const toggleLang = () => {
    const newLang = lang === "en" ? "fr" : "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  // --- Authentification + menu compte ---
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("userEmail") || "");
  const [isAccountPopupOpen, setIsAccountPopupOpen] = useState(false);

  // --- Données et filtres principaux ---
  const [reminders, setReminders] = useState([]);
  const [lists, setLists] = useState([]);
  const [error, setError] = useState("");

  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedListId, setSelectedListId] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // --- États reliés aux modales ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleteListModalOpen, setIsDeleteListModalOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [isDeleteAllArchiveModalOpen, setIsDeleteAllArchiveModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  
  // --- Tâches en transition (pour l'undo) ---
  const [completingTasks, setCompletingTasks] = useState({});

  const todayDb = useMemo(() => toDbDate(new Date()), []);

  // Déduit le titre central selon filtre/tab/list sélectionné
  const currentListName = useMemo(() => {
    if (selectedListId !== null) {
      const list = lists.find(l => l.id === selectedListId);
      return list ? list.name : t("all");
    }
    if (priorityFilter !== "all") {
      const priorityLabels = { low: t("low"), medium: t("medium"), high: t("high") };
      return priorityLabels[priorityFilter] || priorityFilter;
    }
    if (selectedTab === "today") {
      return t("today");
    }
    if (selectedTab === "archive") {
      return t("archive");
    }
    return t("all");
  }, [lists, selectedListId, selectedTab, priorityFilter, lang]);
  // --- Fonctions API LISTES ---
  async function apiFetchLists(token) {
    const res = await fetch(`${API_BASE_URL}/list_lists.php`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Load lists error");
    return data;
  }

  async function apiCreateList(token, list) {
    const res = await fetch(`${API_BASE_URL}/create_list.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(list),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Create list error");
    return data;
  }

  async function apiUpdateList(token, list) {
    const res = await fetch(`${API_BASE_URL}/update_list.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(list),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Update list error");
    return data;
  }

  async function apiDeleteList(token, id) {
    const res = await fetch(`${API_BASE_URL}/delete_list.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Delete list error");
    return data;
  }

  // --- Fonctions API TACHES ---
  async function apiFetchReminders(token) {
    const res = await fetch(`${API_BASE_URL}/list_reminders.php`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Load reminders error");
    return data;
  }

  async function apiCreateReminder(token, reminder) {
    const res = await fetch(`${API_BASE_URL}/create_reminders.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reminder),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Create reminder error");
    return data;
  }

  async function apiUpdateReminder(token, reminder) {
    const res = await fetch(`${API_BASE_URL}/update_reminders.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reminder),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Update reminder error");
    return data;
  }

  async function apiDeleteReminder(token, id) {
    const res = await fetch(`${API_BASE_URL}/delete_reminders.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Delete reminder error");
    return data;
  }

  // Charge les listes et les tâches dès qu'un token valide est disponible
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const [listsData, remindersData] = await Promise.all([
          apiFetchLists(token),
          apiFetchReminders(token),
        ]);
        setLists(Array.isArray(listsData) ? listsData : []);
        setReminders(Array.isArray(remindersData) ? remindersData : []);
      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    })();
  }, [token]);

  // Efface les messages d'erreur après 4s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(t);
  }, [error]);

  // Ferme le menu compte lorsqu'un clic survient à l'extérieur
  useEffect(() => {
    if (!isAccountPopupOpen) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.account-wrapper')) {
        setIsAccountPopupOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isAccountPopupOpen]);

  // Filtrage primaire selon onglets (All/Today/Archive)
  const tabFilteredReminders = useMemo(() => {
    if (!Array.isArray(reminders)) return [];
    
    let filtered = reminders;
    
    if (selectedTab === "archive") {
      return filtered.filter((r) => r.status === "Completed");
    }
    
    filtered = filtered.filter((r) => r.status !== "Completed");
    
    if (selectedTab === "today") {
      filtered = filtered.filter((r) => r.due_date === todayDb);
    }
    
    if (selectedListId !== null) {
      filtered = filtered.filter((r) => r.list_id === selectedListId);
    }
    
    return filtered;
  }, [reminders, selectedTab, selectedListId, todayDb]);

  // Deuxième filtrage : priorité, statut, date
  const filteredReminders = useMemo(() => {
    if (!Array.isArray(tabFilteredReminders)) return [];
    
    return tabFilteredReminders.filter((r) => {
      const matchesPriority =
        priorityFilter === "all" ||
        (r.priority && r.priority.toLowerCase() === priorityFilter);
      const matchesStatus =
        statusFilter === "all" ||
        (r.status && r.status.toLowerCase() === statusFilter);
      const matchesDate = !dateFilter || r.due_date === dateFilter;
      return matchesPriority && matchesStatus && matchesDate;
    });
  }, [tabFilteredReminders, priorityFilter, statusFilter, dateFilter]);

  const hasActiveFilters = priorityFilter !== "all" || statusFilter !== "all" || dateFilter !== "";

  // Réinitialise les filtres en un clic
  const handleClearFilters = () => {
    setPriorityFilter("all");
    setStatusFilter("all");
    setDateFilter("");
  };

  // Enregistre le token et l'email lors de la connexion
  const handleLogin = (newToken, email) => {
    setToken(newToken);
    setUserEmail(email);
    localStorage.setItem("token", newToken);
    localStorage.setItem("userEmail", email);
  };

  // Réinitialise l'état local et supprime les données stockées lors de la déconnexion
  const handleLogout = () => {
    setToken("");
    setUserEmail("");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setReminders([]);
    setLists([]);
    setIsAccountPopupOpen(false);
  };

  // Ouvre la modale de liste et active le mode édition si une liste est fournie
  const openListModal = (list = null) => {
    setEditingList(list);
    setIsListModalOpen(true);
  };

  const closeListModal = () => {
    setIsListModalOpen(false);
    setEditingList(null);
  };

  // Le parent reçoit les données et lance l'API adaptée
  const handleListSubmit = async (listData) => {
    if (!token) {
      setError("You must be logged in.");
      throw new Error("Not logged in");
    }

    try {
      if (listData.id) {
        await apiUpdateList(token, listData);
      } else {
        await apiCreateList(token, listData);
      }

      const data = await apiFetchLists(token);
      setLists(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const openDeleteListModal = (list) => {
    setListToDelete(list);
    setIsDeleteListModalOpen(true);
  };

  const closeDeleteListModal = () => {
    setIsDeleteListModalOpen(false);
    setListToDelete(null);
  };

  const handleDeleteList = async () => {
    if (!token || !listToDelete) {
      setError("You must be logged in.");
      return;
    }

    const id = listToDelete.id;

    if (selectedListId === id) {
      setSelectedListId(null);
    }

    setLists((prev) => prev.filter((l) => l.id !== id));

    try {
      await apiDeleteList(token, id);
      const remindersData = await apiFetchReminders(token);
      setReminders(Array.isArray(remindersData) ? remindersData : []);
    } catch (err) {
      setError(err.message);
      try {
        const data = await apiFetchLists(token);
        setLists(Array.isArray(data) ? data : []);
      } catch (e) {
      }
      throw err;
    }
  };

  // Le bouton "Task" préremplit la modale avec la liste active lorsqu'elle existe
  const openCreateModal = () => {
    if (!token) {
      setError("You must be logged in.");
      return;
    }
    setEditingTask(selectedListId ? { list_id: selectedListId } : null);
    setIsModalOpen(true);
  };

  const openEditModal = (reminder) => {
    if (!token) {
      setError("You must be logged in.");
      return;
    }
    setEditingTask(reminder);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const openViewModal = (reminder) => {
    setViewingTask(reminder);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingTask(null);
  };

  // Soumet la tâche vers l'API en choisissant création ou mise à jour selon la présence d'un id
  const handleModalSubmit = async (taskData) => {
    if (!token) {
      setError("You must be logged in.");
      throw new Error("Not logged in");
    }

    try {
      if (taskData.id) {
        await apiUpdateReminder(token, taskData);
      } else {
        await apiCreateReminder(token, taskData);
      }

      const data = await apiFetchReminders(token);
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Gère le cycle Pending -> In progress -> Completed -> Suppression
  const handleStatusCycle = (task) => {
    const taskId = task.id;
    const currentStatus = task.status || "Pending";
    let newStatus;
    let willDelete = false;

    if (currentStatus === "Pending") {
      newStatus = "In Progress";
    } else if (currentStatus === "In Progress") {
      newStatus = "Completed";
    } else {
      newStatus = "Completed";
      willDelete = true;
    }

    const originalStatus = currentStatus;

    let countdown = 5;
    
    const transitionType = newStatus === "In Progress" ? "to-in-progress" : 
                           newStatus === "Completed" ? "to-completed" : "to-delete";
    
    setCompletingTasks((prev) => ({
      ...prev,
      [taskId]: { countdown, originalStatus, newStatus, willDelete, transitionType },
    }));

    const countdownInterval = setInterval(() => {
      countdown -= 1;
      setCompletingTasks((prev) => {
        if (!prev[taskId]) {
          clearInterval(countdownInterval);
          return prev;
        }
        return {
          ...prev,
          [taskId]: { ...prev[taskId], countdown },
        };
      });
    }, 1000);

    const timeoutId = setTimeout(async () => {
      clearInterval(countdownInterval);
      
      setCompletingTasks((prev) => {
        const newState = { ...prev };
        delete newState[taskId];
        return newState;
      });

      if (willDelete) {
        setReminders((prev) => prev.filter((r) => r.id !== taskId));
        try {
          await apiDeleteReminder(token, taskId);
        } catch (err) {
          setError(err.message);
          try {
            const data = await apiFetchReminders(token);
            setReminders(Array.isArray(data) ? data : []);
          } catch (e) {
          }
        }
      } else {
        setReminders((prev) =>
          prev.map((r) => (r.id === taskId ? { ...r, status: newStatus } : r))
        );
        
        try {
          await apiUpdateReminder(token, { ...task, status: newStatus });
        } catch (err) {
          setError(err.message);
          setReminders((prev) =>
            prev.map((r) => (r.id === taskId ? { ...r, status: originalStatus } : r))
          );
        }
      }
    }, 5000);

    setCompletingTasks((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], timeoutId, countdownInterval },
    }));
  };

  // Bouton Annuler qui restaure l'état d'origine et nettoie les minuteries
  const handleUndoStatusChange = (taskId) => {
    const changingTask = completingTasks[taskId];
    if (changingTask) {
      clearTimeout(changingTask.timeoutId);
      clearInterval(changingTask.countdownInterval);
      
      setReminders((prev) =>
        prev.map((r) => (r.id === taskId ? { ...r, status: changingTask.originalStatus } : r))
      );
      
      setCompletingTasks((prev) => {
        const newState = { ...prev };
        delete newState[taskId];
        return newState;
      });
    }
  };

  // Compatibilité avec anciens boutons "Complete"
  const handleCompleteTask = (task) => {
    handleStatusCycle(task);
  };

  const handleUndoComplete = (taskId) => {
    handleUndoStatusChange(taskId);
  };

  const openDeleteModal = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleDeleteReminder = async () => {
    if (!token || !taskToDelete) {
      setError("You must be logged in.");
      return;
    }

    const id = taskToDelete.id;

    setReminders((prev) => prev.filter((r) => r.id !== id));

    try {
      await apiDeleteReminder(token, id);
    } catch (err) {
      setError(err.message);
      try {
        const data = await apiFetchReminders(token);
        setReminders(Array.isArray(data) ? data : []);
      } catch (e) {
      }
      throw err;
    }
  };

  // Bouton "Delete all" dans l'archive
  const handleDeleteAllArchive = async () => {
    if (!token) {
      setError("You must be logged in.");
      return;
    }

    const archivedTasks = reminders.filter((r) => r.status === "Completed");
    if (archivedTasks.length === 0) return;

    setReminders((prev) => prev.filter((r) => r.status !== "Completed"));

    try {
      await Promise.all(archivedTasks.map((task) => apiDeleteReminder(token, task.id)));
    } catch (err) {
      setError(err.message);
      try {
        const data = await apiFetchReminders(token);
        setReminders(Array.isArray(data) ? data : []);
      } catch (e) {
      }
      throw err;
    }
  };

  // Sans token valide, on affiche directement l'écran de connexion
  if (!token) {
    return <Login onLogin={handleLogin} lang={lang} onToggleLang={toggleLang} />;
  }

  return (
    <div className="app">
      {/* Barre supérieure avec logo, bascule de langue et menu compte */}
      <header className="top-bar">
        <img src={taskzzLogo} alt="Taskzz" className="header-logo" />
        <button
          type="button"
          className="lang-toggle-main"
          onClick={toggleLang}
        >
          {lang === "en" ? "FR" : "EN"}
        </button>
        <div className="account-wrapper">
          <button
            type="button"
            className="account-button"
            onClick={() => setIsAccountPopupOpen(!isAccountPopupOpen)}
            aria-label="Account menu"
          >
            <AccountIcon className="profile-icon" />
          </button>
          
          {isAccountPopupOpen && (
            <div className="account-popup">
              <div className="account-popup-header">
                <span className="account-popup-label">{t("account")}</span>
                <span className="account-popup-email">{userEmail}</span>
              </div>
              <button
                type="button"
                className="account-popup-logout"
                onClick={handleLogout}
              >
                {t("logOut")}
              </button>
            </div>
          )}
        </div>
      </header>

      {error && <div className="status-bar status-error">{error}</div>}

      <div className="app-body">
        {/* Colonne latérale : onglets, filtres et listes personnalisées */}
        <aside className="sidebar">
          <button
            className={`tab tab-all ${selectedTab === "all" && selectedListId === null ? "tab-selected" : ""}`}
            onClick={() => {
              setSelectedTab("all");
              setSelectedListId(null);
            }}
          >
            {t("all")}
          </button>
          
          <div className="filter-tabs">
            <button
              className={`tab tab-today ${selectedTab === "today" && selectedListId === null ? "tab-selected" : ""}`}
              onClick={() => {
                setSelectedTab("today");
                setSelectedListId(null);
              }}
            >
              {t("today")}
            </button>
            <button
              className={`tab tab-archive ${selectedTab === "archive" ? "tab-selected" : ""}`}
              onClick={() => {
                setSelectedTab("archive");
                setSelectedListId(null);
              }}
            >
              {t("archive")}
            </button>
          </div>

          <div className="sidebar-section-header">
            <div className="sidebar-section-title">{t("filters")}</div>
            {hasActiveFilters && (
              <button
                type="button"
                className="reset-filters-button"
                onClick={handleClearFilters}
              >
                {t("reset")}
              </button>
            )}
          </div>
          
          <div className="sidebar-filter-group">
            <span className="sidebar-filter-label">{t("priority")}</span>
            <div className="sidebar-filter-pills priority-pills">
              <button
                type="button"
                className={`filter-pill ${priorityFilter === "low" ? "filter-pill-active" : ""}`}
                onClick={() => setPriorityFilter(priorityFilter === "low" ? "all" : "low")}
              >
                {t("low")}
              </button>
              <button
                type="button"
                className={`filter-pill ${priorityFilter === "medium" ? "filter-pill-active" : ""}`}
                onClick={() => setPriorityFilter(priorityFilter === "medium" ? "all" : "medium")}
              >
                {t("medium")}
              </button>
              <button
                type="button"
                className={`filter-pill ${priorityFilter === "high" ? "filter-pill-active" : ""}`}
                onClick={() => setPriorityFilter(priorityFilter === "high" ? "all" : "high")}
              >
                {t("high")}
              </button>
            </div>
          </div>

          <div className="sidebar-filter-group">
            <span className="sidebar-filter-label">{t("status")}</span>
            <div className="sidebar-filter-pills status-pills">
              <button
                type="button"
                className={`filter-pill ${statusFilter === "pending" ? "filter-pill-active" : ""}`}
                onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
              >
                {t("pending")}
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === "in progress" ? "filter-pill-active" : ""}`}
                onClick={() => setStatusFilter(statusFilter === "in progress" ? "all" : "in progress")}
              >
                {t("inProgress")}
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === "completed" ? "filter-pill-active" : ""}`}
                onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
              >
                {t("completed")}
              </button>
            </div>
          </div>

          <div className="sidebar-filter-group">
            <span className="sidebar-filter-label">{t("dueDate")}</span>
            <input
              type="date"
              className="sidebar-date-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button
                type="button"
                className="sidebar-clear-date"
                onClick={() => setDateFilter("")}
              >
                {t("clearDate")}
              </button>
            )}
          </div>

          <div className="sidebar-section-title">{t("lists")}</div>

          {lists.map((list) => (
            <div key={list.id} className="list-item-wrapper">
              <button
                className={`list-button ${selectedListId === list.id ? "list-selected" : ""}`}
                style={{ backgroundColor: list.color || "#0b304f" }}
                onClick={() => {
                  setSelectedListId(list.id);
                  setSelectedTab("all");
                }}
              >
                {list.name}
              </button>
              <div className="list-item-actions">
                <button
                  type="button"
                  className="list-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openListModal(list);
                  }}
                  aria-label="Edit list"
                >
                  <EditIcon className="list-action-icon" />
                </button>
                <button
                  type="button"
                  className="list-action-btn list-action-btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteListModal(list);
                  }}
                  aria-label="Delete list"
                >
                  <DeleteIcon className="list-action-icon" />
                </button>
              </div>
            </div>
          ))}

          {lists.length === 0 && (
            <div className="no-lists-placeholder">{t("noListsYet")}</div>
          )}

          <button className="add-list-button" onClick={() => openListModal()}>
            <span className="add-list-icon" aria-hidden="true">
              <span className="add-list-icon-plus" />
            </span>
            <span>{t("addNewList")}</span>
          </button>
        </aside>

        {/* Zone centrale : titre courant et cartes de tâches */}
        <main className="main-area">
          <div className="main-header">
            <h1 className="reminder-title">{currentListName}</h1>
            {selectedTab === "archive" && filteredReminders.length > 0 && (
              <button
                type="button"
                className="delete-all-archive-button"
                onClick={() => setIsDeleteAllArchiveModalOpen(true)}
              >
                {t("deleteAll")}
              </button>
            )}
          </div>

          <div className="glass-card">
            {filteredReminders.length === 0 ? (
              <div className="reminders-empty">
                {t("noTasksYet")}
              </div>
            ) : (
              filteredReminders.map((r) => {
                const isCompleting = !!completingTasks[r.id];
                const countdown = completingTasks[r.id]?.countdown || 0;
                const transitionType = completingTasks[r.id]?.transitionType || "";
                const newStatus = completingTasks[r.id]?.newStatus;
                const displayStatus = isCompleting && newStatus ? newStatus : (r.status || "Pending");
                const statusClass = displayStatus.toLowerCase().replace(' ', '-');

                return (
                  <div 
                    className={`task-row ${isCompleting ? `task-row-completing ${transitionType}` : ""}`} 
                    key={r.id}
                  >
                    <div className="task-left">
                      <div 
                        className={`task-checkbox task-status-${statusClass}`}
                        onClick={() => {
                          if (!isCompleting) {
                            handleStatusCycle(r);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (!isCompleting) {
                              handleStatusCycle(r);
                            }
                          }
                        }}
                      >
                        <span className="task-checkbox-circle">
                          <span className="task-checkbox-half"></span>
                          <span className="task-checkbox-check">
                            <CheckmarkIcon />
                          </span>
                        </span>
                      </div>
                      <div className="task-content">
                        <div
                          role="button"
                          tabIndex={0}
                          className="task-content-clickable"
                          onClick={() => openViewModal(r)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openViewModal(r);
                            }
                          }}
                        >
                        <div className={`task-title ${displayStatus === "Completed" ? "task-title-completed" : ""}`}>
                          {r.title}
                        </div>
                        {r.list_name && (
                          <span 
                            className="task-list-badge"
                            style={{ backgroundColor: r.list_color || "#0b304f" }}
                          >
                            {r.list_name}
                          </span>
                        )}
                        </div>
                      </div>
                    </div>

                    <div className="task-meta">
                      {isCompleting ? (
                        <button
                          type="button"
                          className={`task-undo-button ${transitionType}`}
                          onClick={() => handleUndoComplete(r.id)}
                        >
                          <span>{t("undo")}</span>
                          <span className="task-undo-timer">{countdown}</span>
                        </button>
                      ) : (
                        <>
                          <span className="task-meta-text">
                            {r.priority || t("priority")}
                          </span>
                          <span className="task-meta-text">
                            {r.due_date ? formatDisplayDate(r.due_date) : t("dueDate")}
                          </span>

                          <button
                            type="button"
                            className="task-meta-button"
                            onClick={() => openEditModal(r)}
                          >
                            <EditIcon className="task-meta-icon" />
                            <span>{t("edit")}</span>
                          </button>

                          <button
                            type="button"
                            className="task-meta-button task-meta-button-danger"
                            onClick={() => openDeleteModal(r)}
                          >
                            <DeleteIcon className="task-meta-icon" />
                            <span>{t("delete")}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* Bouton flottant pour créer rapidement une tâche */}
      <button
        className="brand-pill"
        type="button"
        onClick={openCreateModal}
        aria-label="Create a new task"
      >
        <img src={taskButtonImg} alt="Create task" />
      </button>

      {/* Modale de création/édition de tâche */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        initialData={editingTask}
        lists={lists}
        t={t}
      />

      <TaskModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        onSubmit={() => {}}
        initialData={viewingTask}
        lists={lists}
        t={t}
        readOnly={true}
      />

      {/* Modale de création/édition de liste */}
      <ListModal
        isOpen={isListModalOpen}
        onClose={closeListModal}
        onSubmit={handleListSubmit}
        initialData={editingList}
        t={t}
      />

      {/* Fenêtre de confirmation pour supprimer une tâche */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteReminder}
        title={t("deleteTask")}
        message={`${t("deleteTaskConfirm")} "${taskToDelete?.title}"? ${t("thisActionCannotBeUndone")}`}
        confirmText={t("delete")}
        confirmDanger={true}
      />

      {/* Fenêtre de confirmation pour supprimer une liste */}
      <ConfirmModal
        isOpen={isDeleteListModalOpen}
        onClose={closeDeleteListModal}
        onConfirm={handleDeleteList}
        title={t("deleteList")}
        message={`${t("deleteListConfirm")} "${listToDelete?.name}"? ${t("tasksWillBeKept")}`}
        confirmText={t("delete")}
        confirmDanger={true}
      />

      {/* Fenêtre de confirmation pour purger toutes les tâches archivées */}
      <ConfirmModal
        isOpen={isDeleteAllArchiveModalOpen}
        onClose={() => setIsDeleteAllArchiveModalOpen(false)}
        onConfirm={handleDeleteAllArchive}
        title={t("deleteAllArchived")}
        message={`${t("deleteAllArchivedConfirm")} ${reminders.filter(r => r.status === "Completed").length} ${t("archivedTasks")}? ${t("thisActionCannotBeUndone")}`}
        confirmText={t("deleteAll")}
        confirmDanger={true}
      />
    </div>
  );
}

export default App;
