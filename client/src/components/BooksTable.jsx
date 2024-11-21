import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const fetchBooks = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const { data } = await axios.get("http://localhost:8080/api/books");
  return data;
};

export default function BooksTable() {
  const { isSignedIn, user } = useUser();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    price: 0,
    publicationYear: new Date().getFullYear(),
    isbn: "",
  });

  const {
    data: books,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  });

  const createBookMutation = useMutation({
    mutationFn: (newBook) =>
      axios.post(`http://localhost:8080/api/books?clerkId=${user.id}`, newBook),
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ id, book }) =>
      axios.put(
        `http://localhost:8080/api/books/${id}?clerkId=${user.id}`,
        book
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id) => axios.delete(`http://localhost:8080/api/books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      publicationYear: parseInt(formData.publicationYear),
    };

    if (selectedBook) {
      updateBookMutation.mutate({ id: selectedBook.id, book: submitData });
    } else {
      createBookMutation.mutate(submitData);
    }
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      publicationYear: book.publicationYear,
      isbn: book.isbn,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      deleteBookMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      description: "",
      price: 0,
      publicationYear: new Date().getFullYear(),
      isbn: "",
    });
    setSelectedBook(null);
  };

  const handleOpenChange = (open) => {
    setIsModalOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <SignIn />
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-lg font-semibold text-gray-600">
          Loading books...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-red-500 bg-red-100 p-4 rounded-lg shadow">
          Error: {error.message}
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Books Collection</h2>
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Add New Book</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedBook ? "Edit Book" : "Add New Book"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Author</label>
                <Input
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Publication Year
                  </label>
                  <Input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.publicationYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publicationYear: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ISBN</label>
                <Input
                  value={formData.isbn}
                  onChange={(e) =>
                    setFormData({ ...formData, isbn: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedBook ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>ISBN</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books?.map((book) => (
            <TableRow key={book.id}>
              <TableCell>
                <img
                  src={book.user?.imageUrl}
                  alt={book.user?.username}
                  className="w-8 h-8 rounded-full"
                />
              </TableCell>
              <TableCell>{book.id}</TableCell>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.description}</TableCell>
              <TableCell>${book.price?.toFixed(2)}</TableCell>
              <TableCell>{book.publicationYear}</TableCell>
              <TableCell>{book.isbn}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(book)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(book.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
