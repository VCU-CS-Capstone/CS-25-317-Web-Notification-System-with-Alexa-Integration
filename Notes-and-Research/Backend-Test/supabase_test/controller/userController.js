import supabase from "../config/supabaseClient.js";

export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase
      .from("users")
      .select("password, id, username")
      .eq("email", email);

    if (error) throw error;
    if (!data || data.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = data[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      return res.status(200).json({ id: user.id, username: user.username });
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const AddUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([{ username, email, password: hashedPassword, role: "user" }]);

    if (error) throw error;
    return res.status(201).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
