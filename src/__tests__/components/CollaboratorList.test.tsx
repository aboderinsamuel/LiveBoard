import React from "react";
import { render, screen } from "@testing-library/react";
import { CollaboratorList } from "@/components/CollaboratorList";
import { Collaborator } from "@/types/whiteboard";

describe("CollaboratorList", () => {
  const mockCollaborators: Collaborator[] = [
    {
      id: "user1",
      name: "John Doe",
      color: "#ff0000",
      isActive: true,
      lastSeen: Date.now(),
      cursor: { x: 100, y: 200 },
    },
    {
      id: "user2",
      name: "Jane Smith",
      color: "#00ff00",
      isActive: true,
      lastSeen: Date.now(),
    },
    {
      id: "user3",
      name: "Bob Johnson",
      color: "#0000ff",
      isActive: false,
      lastSeen: Date.now() - 300000, // 5 minutes ago
    },
  ];

  it("should render collaborator list", () => {
    render(<CollaboratorList collaborators={mockCollaborators} />);

    expect(screen.getByText("Collaborators")).toBeInTheDocument();
  });

  it("should show active collaborators", () => {
    render(<CollaboratorList collaborators={mockCollaborators} />);

    expect(screen.getByText("Online (2)")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("should show inactive collaborators", () => {
    render(<CollaboratorList collaborators={mockCollaborators} />);

    expect(screen.getByText("Recently Left (1)")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("should show cursor position for active collaborators", () => {
    render(<CollaboratorList collaborators={mockCollaborators} />);

    expect(screen.getByText("Drawing at (100, 200)")).toBeInTheDocument();
  });

  it("should show active status indicators", () => {
    render(<CollaboratorList collaborators={mockCollaborators} />);

    const activeIndicators = screen.getAllByText("Active");
    expect(activeIndicators).toHaveLength(2);

    const offlineIndicators = screen.getAllByText("Offline");
    expect(offlineIndicators).toHaveLength(1);
  });

  it("should show collaborator colors", () => {
    render(<CollaboratorList collaborators={mockCollaborators} />);

    const colorIndicators = screen.getAllByRole("generic");
    const redIndicator = colorIndicators.find(
      (el) => el.style.backgroundColor === "rgb(255, 0, 0)"
    );
    const greenIndicator = colorIndicators.find(
      (el) => el.style.backgroundColor === "rgb(0, 255, 0)"
    );
    const blueIndicator = colorIndicators.find(
      (el) => el.style.backgroundColor === "rgb(0, 0, 255)"
    );

    expect(redIndicator).toBeInTheDocument();
    expect(greenIndicator).toBeInTheDocument();
    expect(blueIndicator).toBeInTheDocument();
  });

  it("should handle empty collaborator list", () => {
    render(<CollaboratorList collaborators={[]} />);

    expect(screen.getByText("No collaborators yet")).toBeInTheDocument();
  });

  it("should show last seen time for inactive collaborators", () => {
    const inactiveCollaborator: Collaborator = {
      id: "user1",
      name: "Inactive User",
      color: "#ff0000",
      isActive: false,
      lastSeen: Date.now() - 600000, // 10 minutes ago
    };

    render(<CollaboratorList collaborators={[inactiveCollaborator]} />);

    expect(screen.getByText(/Left/)).toBeInTheDocument();
  });

  it("should group collaborators correctly", () => {
    const mixedCollaborators: Collaborator[] = [
      {
        id: "user1",
        name: "Active User 1",
        color: "#ff0000",
        isActive: true,
        lastSeen: Date.now(),
      },
      {
        id: "user2",
        name: "Active User 2",
        color: "#00ff00",
        isActive: true,
        lastSeen: Date.now(),
      },
      {
        id: "user3",
        name: "Inactive User 1",
        color: "#0000ff",
        isActive: false,
        lastSeen: Date.now() - 300000,
      },
      {
        id: "user4",
        name: "Inactive User 2",
        color: "#ffff00",
        isActive: false,
        lastSeen: Date.now() - 600000,
      },
    ];

    render(<CollaboratorList collaborators={mixedCollaborators} />);

    expect(screen.getByText("Online (2)")).toBeInTheDocument();
    expect(screen.getByText("Recently Left (2)")).toBeInTheDocument();
  });

  it("should apply correct styling for active collaborators", () => {
    render(<CollaboratorList collaborators={mockCollaborators} />);

    const johnDoeElement = screen.getByText("John Doe").closest("div");
    expect(johnDoeElement).toHaveClass("bg-green-50", "border-green-200");
  });

  it("should apply correct styling for inactive collaborators", () => {
    render(<CollaboratorList collaborators={mockCollaborators} />);

    const bobJohnsonElement = screen.getByText("Bob Johnson").closest("div");
    expect(bobJohnsonElement).toHaveClass("bg-gray-50", "border-gray-200");
  });
});
