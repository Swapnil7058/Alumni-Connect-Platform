// import Sidebar from "../alumini_layout/Sidebar";
// import Header from "../alumini_layout/Header";
import ProfileViewerEditor from "../alumniProfile/ProfileViewerEditor";
import RoleSidebar from "../../../shared/RoleSidebar";

const AlumniProfile = () => {
  return (
    <div className="flex bg-[#f1f5f9] min-h-screen">
      <RoleSidebar role="alumni" />
      <div className="flex-1 flex flex-col ml-64">
        <ProfileViewerEditor />
      </div>
    </div>
  );
};

export default AlumniProfile;
