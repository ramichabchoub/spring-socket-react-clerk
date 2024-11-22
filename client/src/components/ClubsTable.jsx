import { useState, useEffect } from "react";
import axios from "axios";
import { SignIn, useUser } from "@clerk/clerk-react";
import { websocketEvents } from "@/hooks/useWebSocket";
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

export default function ClubsTable() {
  const { isSignedIn, user } = useUser();
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    membershipFee: 0,
    foundingYear: new Date().getFullYear(),
    contactEmail: "",
  });

  // Initial fetch of clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data } = await axios.get("http://localhost:8080/api/clubs");
        setClubs(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // WebSocket subscriptions
  useEffect(() => {
    const clubUpdateUnsub = websocketEvents.subscribe("clubUpdate", (club) => {
      setClubs((currentClubs) => {
        const index = currentClubs.findIndex((c) => c.id === club.id);
        if (index === -1) {
          return [...currentClubs, club];
        }
        const newClubs = [...currentClubs];
        newClubs[index] = club;
        return newClubs;
      });
    });

    const clubDeleteUnsub = websocketEvents.subscribe(
      "clubDelete",
      (clubId) => {
        setClubs((currentClubs) =>
          currentClubs.filter((club) => club.id !== clubId)
        );
      }
    );

    return () => {
      clubUpdateUnsub();
      clubDeleteUnsub();
    };
  }, []);

  const createClub = async (newClub) => {
    try {
      await axios.post(
        `http://localhost:8080/api/clubs?clerkId=${user.id}`,
        newClub
      );
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating club:", error);
    }
  };

  const updateClub = async ({ id, club }) => {
    try {
      await axios.put(
        `http://localhost:8080/api/clubs/${id}?clerkId=${user.id}`,
        club
      );
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating club:", error);
    }
  };

  const deleteClub = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/clubs/${id}`);
    } catch (error) {
      console.error("Error deleting club:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      membershipFee: parseFloat(formData.membershipFee),
      foundingYear: parseInt(formData.foundingYear),
    };

    if (selectedClub) {
      updateClub({ id: selectedClub.id, club: submitData });
    } else {
      createClub(submitData);
    }
  };

  const handleEdit = (club) => {
    setSelectedClub(club);
    setFormData({
      name: club.name,
      description: club.description,
      location: club.location,
      membershipFee: club.membershipFee,
      foundingYear: club.foundingYear,
      contactEmail: club.contactEmail,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this club?")) {
      deleteClub(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      membershipFee: 0,
      foundingYear: new Date().getFullYear(),
      contactEmail: "",
    });
    setSelectedClub(null);
  };

  const handleOpenChange = (open) => {
    setIsModalOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center h-full py-8">
        <SignIn />
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-pulse text-lg font-semibold text-gray-600">
          Loading clubs...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="text-red-500 bg-red-100 p-4 rounded-lg shadow">
          Error: {error.message}
        </div>
      </div>
    );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Clubs Directory</h2>
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Add New Club</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedClub ? "Edit Club" : "Add New Club"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                  <label className="text-sm font-medium">
                    Membership Fee ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.membershipFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membershipFee: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Founded Year</label>
                  <Input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.foundingYear}
                    onChange={(e) =>
                      setFormData({ ...formData, foundingYear: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
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
                  {selectedClub ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Membership Fee</TableHead>
              <TableHead>Founded Year</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs?.map((club) => (
              <TableRow key={club.id}>
                <TableCell>
                  <img
                    src={club.user?.imageUrl}
                    alt={club.user?.username}
                    className="w-8 h-8 rounded-full"
                  />
                </TableCell>
                <TableCell>{club.id}</TableCell>
                <TableCell>{club.name}</TableCell>
                <TableCell>{club.description}</TableCell>
                <TableCell>{club.location}</TableCell>
                <TableCell>${club.membershipFee?.toFixed(2)}</TableCell>
                <TableCell>{club.foundingYear}</TableCell>
                <TableCell>{club.contactEmail}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(club)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(club.id)}
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
    </div>
  );
}
