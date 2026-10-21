# Future writing and labs

Editorial backlog started 20 October 2026. These are ideas, not published articles or scheduled releases. The order does not imply priority. This file is not linked from the website navigation; like other repository files, it may still be publicly accessible after deployment.

## Technical writing

| Topic | Status | Initial direction |
| --- | --- | --- |
| [Spline interpolation](article-plans/spline-interpolation.md) | Source reviewed; article not drafted | Natural cubic splines: from smooth curves to a tridiagonal system |
| Absorbing boundary conditions | Idea | How artificial boundaries reduce reflections in wave simulations |
| Wave equation derivation | Idea | Derive the equation from physical assumptions and explain each term |
| Hann window smoothing | Idea | Explain the window, normalization, and its use for smoothing sampled data |
| Projectile motion | Idea | Connect an analytical trajectory with a numerical simulation |
| Logic gates for addition | Idea | Build from a half adder to a full adder and multi-bit addition |
| Logic gates for multiplication | Idea | Combine partial products and adders to multiply binary numbers |
| Z-transform | Idea | Connect discrete sequences, shifts, and linear systems |
| Generalized gradient operator | Idea | Define the intended formulation and application before drafting |
| Float byte swap | Idea | Explain byte order, floating-point representation, and binary-data conversion |
| Green's function | Idea | Explain the response to an impulse and how it relates to more general sources |
| Coordinate transformation series: vectors and metric tensor | Idea | Develop a series on coordinate transformations, vector components, and the metric tensor |
| Derivation of Traction Symmetry from the Momentum Balance Equation | Idea | Develop from my notes on Aki–Richards; verify the assumptions and terminology against the notes |
| Seismic ghost | Idea | Explain seismic ghost formation and its effect on recorded wavefields |

## Personal writing

| Topic | Status | Initial direction |
| --- | --- | --- |
| The importance of writing | Idea | Explore how writing supports thinking and communication |
| The importance of reflection | Idea | Explore reflection as a practice for learning from experience |
| The implications of AI | Idea | Reflect on how AI affects learning, work, and judgment |
| The significance of feedback | Idea | Explore how feedback supports learning and improvement |
| The trait of listening | Idea | Reflect on listening as a personal and interpersonal practice |

## Labs

| Topic | Status | Initial direction |
| --- | --- | --- |
| Different absorbing boundary conditions | Idea | Compare boundary treatments under the same source, model, and numerical settings |
| Controlled experiment to demonstrate dispersion and stability | Idea | Vary spatial and temporal sampling to distinguish dispersion from instability |
| Projectile motion | Idea | Compare numerical trajectories with an analytical solution |
| Green's function | Idea | Explore impulse responses and the construction of responses to other sources |
| Coordinate transformation | Idea | Visualize coordinate systems and how vector components change |
| Ghosting operator | Idea | Explore how a ghosting operator changes a signal in time and frequency |

The directions above are starting points to refine, not fixed article scopes.

## Using this backlog

Add new topics to the appropriate table. Writing and lab entries on the same subject are separate deliverables that can be linked as companions. When work starts, create a linked plan in `docs/article-plans/` with its central question, source material, outline, figures, and validation needs. Update its status to Drafting or Ready for review as appropriate. Once published, add its article link and mark it Published so the history remains useful.
