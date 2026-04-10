import { useState } from "react";
import { Plus, Trash2, UserCircle, Phone as PhoneIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "Mom", phone: "+1 555-0101" },
    { id: "2", name: "Best Friend", phone: "+1 555-0202" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const addContact = () => {
    if (!name.trim() || !phone.trim()) return;
    setContacts(prev => [...prev, { id: Date.now().toString(), name: name.trim(), phone: phone.trim() }]);
    setName("");
    setPhone("");
    setShowForm(false);
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Emergency Contacts</h1>
        <p className="text-sm text-muted-foreground">People who will be alerted in an emergency</p>
      </div>

      <div className="space-y-3 px-5">
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
                onClick={() => removeContact(contact.id)}
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
                onClick={addContact}
                className="flex-1 rounded-xl gradient-primary py-3 font-display font-semibold text-primary-foreground"
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
