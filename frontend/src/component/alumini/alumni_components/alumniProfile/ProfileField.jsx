const ProfileField = ({ icon, label, name, value, editMode, onChange }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>

      {editMode ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="text-gray-800 font-medium">{value}</p>
      )}
    </div>
  );
};

export default ProfileField;