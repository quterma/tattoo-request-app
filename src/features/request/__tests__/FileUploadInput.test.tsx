import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { FileUploadInput } from "../ui/FileUploadInput"

function makeFile(name: string) {
  return new File(["x"], name, { type: "image/jpeg" })
}

const maxFilesWarning = "You can upload up to 3 images. Extra files were not added."
const removeFileLabel = (fileName: string) => `Remove ${fileName}`

const baseProps = {
  id: "referenceImages",
  label: "Reference images",
  buttonText: "Choose files",
  maxFiles: 3,
  maxFilesWarning,
  removeFileLabel,
}

describe("FileUploadInput", () => {
  afterEach(() => {
    cleanup()
  })

  it("selecting multiple files in one pick keeps all of them, up to maxFiles", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FileUploadInput {...baseProps} value={[]} onChange={onChange} />)

    const input = screen.getByLabelText("Reference images") as HTMLInputElement
    const files = [makeFile("a.jpg"), makeFile("b.jpg")]
    await user.upload(input, files)

    expect(onChange).toHaveBeenCalledWith(files)
  })

  it("accumulates files across separate single-file picks instead of replacing", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const first = makeFile("a.jpg")

    const { rerender } = render(<FileUploadInput {...baseProps} value={[]} onChange={onChange} />)

    const input = screen.getByLabelText("Reference images") as HTMLInputElement
    await user.upload(input, [first])
    expect(onChange).toHaveBeenLastCalledWith([first])

    const second = makeFile("b.jpg")
    rerender(<FileUploadInput {...baseProps} value={[first]} onChange={onChange} />)
    await user.upload(input, [second])

    expect(onChange).toHaveBeenLastCalledWith([first, second])
  })

  it("caps accumulated files at maxFiles", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const existing = [makeFile("a.jpg"), makeFile("b.jpg")]

    render(<FileUploadInput {...baseProps} value={existing} onChange={onChange} />)

    const input = screen.getByLabelText("Reference images") as HTMLInputElement
    const extra = [makeFile("c.jpg"), makeFile("d.jpg")]
    await user.upload(input, extra)

    expect(onChange).toHaveBeenLastCalledWith([...existing, extra[0]])
  })

  it("shows a warning when a pick would exceed maxFiles, dropping the extras", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const existing = [makeFile("a.jpg"), makeFile("b.jpg")]

    render(<FileUploadInput {...baseProps} value={existing} onChange={onChange} />)

    const input = screen.getByLabelText("Reference images") as HTMLInputElement
    await user.upload(input, [makeFile("c.jpg"), makeFile("d.jpg")])

    expect(screen.getByRole("alert")).toHaveTextContent(maxFilesWarning)
  })

  it("does not show a warning when a pick stays within maxFiles", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<FileUploadInput {...baseProps} value={[]} onChange={onChange} />)

    const input = screen.getByLabelText("Reference images") as HTMLInputElement
    await user.upload(input, [makeFile("a.jpg")])

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("clears the warning when a selected file is removed", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const existing = [makeFile("a.jpg"), makeFile("b.jpg")]

    const { rerender } = render(
      <FileUploadInput {...baseProps} value={existing} onChange={onChange} />,
    )

    const input = screen.getByLabelText("Reference images") as HTMLInputElement
    await user.upload(input, [makeFile("c.jpg"), makeFile("d.jpg")])
    expect(screen.getByRole("alert")).toBeInTheDocument()

    const afterUpload = onChange.mock.calls[onChange.mock.calls.length - 1][0] as File[]
    rerender(<FileUploadInput {...baseProps} value={afterUpload} onChange={onChange} />)

    await user.click(screen.getByRole("button", { name: "Remove a.jpg" }))
    const afterRemove = onChange.mock.calls[onChange.mock.calls.length - 1][0] as File[]
    expect(afterRemove).toEqual([afterUpload[1], afterUpload[2]])

    rerender(<FileUploadInput {...baseProps} value={afterRemove} onChange={onChange} />)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("removing a file updates the rendered file list and allows adding another", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const [a, b] = [makeFile("a.jpg"), makeFile("b.jpg")]

    const { rerender } = render(<FileUploadInput {...baseProps} value={[a, b]} onChange={onChange} />)

    expect(screen.getByText("a.jpg")).toBeInTheDocument()
    expect(screen.getByText("b.jpg")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Remove a.jpg" }))
    expect(onChange).toHaveBeenLastCalledWith([b])

    rerender(<FileUploadInput {...baseProps} value={[b]} onChange={onChange} />)
    expect(screen.queryByText("a.jpg")).not.toBeInTheDocument()
    expect(screen.getByText("b.jpg")).toBeInTheDocument()

    const input = screen.getByLabelText("Reference images") as HTMLInputElement
    const c = makeFile("c.jpg")
    await user.upload(input, [c])
    expect(onChange).toHaveBeenLastCalledWith([b, c])
  })
})
