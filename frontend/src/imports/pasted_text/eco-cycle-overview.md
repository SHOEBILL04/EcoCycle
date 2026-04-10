EcoCycle — Gamified Waste Classification & Reward Engine

Problem Overview ->
Waste misclassification at the point of disposal is one of the leading causes of recycling
failure in urban areas. When citizens cannot confidently determine whether an item is
recyclable, organic, hazardous, or electronic waste, they frequently default to mixed disposal,
undermining the downstream recycling process.
Static guides and lookup tables have proven insufficient because they are passive, impersonal,
and do not create sustained engagement. A more effective solution is a platform that assists
classification actively, communicates uncertainty honestly, rewards correct participation
over time, and embeds user activity within a visible community context.
Objective ->
Develop a waste classification and community reward platform where users submit waste
item images. The system must classify each item into a predefined category and return a
confidence score for every decision.
The platform must support multiple classification approaches that can be selected and
compared at runtime. System behavior must vary according to confidence:
• High-confidence classification: proceeds immediately.
• Low-confidence classification: enters a resolution workflow before any reward is
issued.
The platform is community-oriented rather than private: users have public profiles displaying
classification history, earned points, and community rank.
Functional Requirements ->
Classification The system shall have the following:
• Accept waste-item images and classify them into one of the following categories: recyclable,
organic, e-waste, hazardous.
• Support subcategories within each class where feasible, though subcategories are optional.
• Attach a confidence score in the range [0,1] to every classification decision.
• Support at least two independent classification approaches, selectable per request or via
configuration.
• Ensure that both approaches produce meaningfully different confidence values on ambiguous
input.
• Define a confidence threshold externally in configuration.
• Allow classifications meeting or exceeding the threshold to proceed directly to point award.
• Send classifications below the threshold into a dispute-resolution workflow.
Dispute resolution requirements:
• The dispute workflow must attempt resolution using the alternative classification approach.
• The final outcome must be recorded.
• The submitting user must be informed of the current submission state.
Reward and State Machine Every submission must move through a strictly validated state
machine.
The system shall:
• Reject invalid state transitions at the system level.
• Prevent redemption before a submission has been resolved.
• Guarantee idempotent point awards so repeated identical requests never generate multiple
rewards.
• Process redemption atomically.
• Detect and flag repeated submission of identical or near-identical images by the same user
within a defined time window.
• Ensure flagged submissions yield no points.
• Record flagged submissions in the audit trail.
Social Layer The platform shall provide:
• Public profiles containing username, total points, classification count, accuracy rate, and
community rank.
• Privacy settings allowing users to mark profiles private; private profiles are accessible only
to the user and administrators.
• Alive leaderboard ranked by total verified points with updates reflected within 60 seconds.
• A follow system enabling users to follow one another.
• An activity feed showing recent classifications from followed accounts, including category,
confidence score, and points awarded.
Privacy enforcement requirement:
• Users with private profiles must not appear in other users’ feeds, regardless of follow status.
Role-Based Access Control The system must implement three roles with distinct permissions.

Role:                Permissions:
Citizen           -> Submit classifications, earn and redeem points, manage own profile,
		     follow users, and view the public leaderboard and activity feeds.
Moderator         -> All Citizen permissions, plus view and act on the dispute queue,
		     resolve flagged submissions, and inspect audit entries for submissions
		     under review.
Administrator     -> All Moderator permissions, plus manage user roles, adjust system configuration, view full audit trails, 		     and access system-level observability
	 	     endpoints.

Access-control requirements:
• Role enforcement must occur at the API layer on every request.
• Unauthorized access must return a consistent, documented error response.
• All role assignments and role changes must be audit logged.
Audit Trail Every event must be written to the audit log as part of the same operation that
triggers it.
Audited events include:
• Classification decisions, state transitions, and point awards.
• Disputes, resolutions, and redemptions.
• Fraud flags, role changes, and social actions.
Constraint:
• Deferred or asynchronous audit writes are not acceptable.
