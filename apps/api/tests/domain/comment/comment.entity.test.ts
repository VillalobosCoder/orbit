import { describe, expect, it } from "vitest";
import { Comment } from "../../../src/domain/comment/comment.entity.js";
import { NotCommentAuthorError } from "../../../src/domain/comment/comment.errors.js";
import { aComment } from "../../support/fixtures.js";

describe("Comment", () => {
  it("trims the body on register and on edit", () => {
    expect(Comment.register({ issueId: 1, authorId: 2, body: "  hi " }).body).toBe("hi");
    expect(aComment().withBody("  edited ").body).toBe("edited");
  });

  it("keeps the author when edited", () => {
    expect(aComment({ authorId: 4 }).withBody("x").authorId).toBe(4);
  });

  it("only the author passes the authorship check", () => {
    const comment = aComment({ authorId: 1 });

    expect(() => comment.assertWrittenBy(1)).not.toThrow();
    expect(() => comment.assertWrittenBy(2)).toThrow(NotCommentAuthorError);
  });
});
