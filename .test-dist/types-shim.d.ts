declare module "@/types/database" {
  export type Database = {
    public: {
      Enums: {
        incident_status:
          | "pending"
          | "under_review"
          | "needs_revision"
          | "approved"
          | "rejected"
          | "archived";
      };
    };
  };
}
