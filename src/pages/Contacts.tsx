import { useState, useEffect } from "react";
import { Plus, Trash2, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

const Contacts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["emergency_contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("id, name, phone")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Contact[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("emergency_contacts").insert({
        user_id: user!.id,
        name: name.trim(),
        phone: phone.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency_contacts"] });
      setName("");
      setPhone("");
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["emergency_contacts"] }),
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Emergency Contacts</h1>
        <p className="text-sm text-muted-foreground">People who will be alerted in an emergency</p>
      </div>

      <div className="space-y-3 px-5">
        {isLoading && <p className="text-center text-muted-foreground">Loading...</p>}
        
        <AnimatePresence>
          {contacts.map(contact => (
            <motion.div
              key={contact.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-foreground">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.phone}</p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(contact.id)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 rounded-2xl border border-primary/30 bg-card p-5"
          >
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contact name"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border border-border py-3 font-display font-semibold text-muted-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => addMutation.mutate()}
                disabled={!name.trim() || !phone.trim()}
                className="flex-1 rounded-xl gradient-primary py-3 font-display font-semibold text-primary-foreground disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 font-display font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-5 w-5" />
            Add Contact
          </button>
        )}
      </div>
    </div>
  );
};

export default Contacts;
