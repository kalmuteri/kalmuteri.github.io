---
title: "From waves | to *computation*"
subtitle: "The wave equation is simple to write. Simulating its behavior in the real world is where the interesting decisions begin."
summary: "An introduction to numerically solving the acoustic wave equation and the tradeoffs of stability and dispersion."
type: "Explainer"
category: "technical"
topic: "Numerical methods"
slug: "from-waves-to-computation"
status: "published"
publication_date: "2026-10-14"
updated_date: "2026-10-16"
article_number: "001"
related_title: "See the idea in action"
related_description: "Try the interactive wavefield, then return here to explore the numerical method."
related_label: "Open the wave simulation"
related_url: "../../lab/acoustic-wave/#simulation"
next_title: "Physics and machine learning are better together"
next_url: "../physics-and-ai/"
---

:::idea
A numerical model replaces a continuous wavefield with values on a grid, then uses mathematical approximations to evolve those values through time.
:::

## 1. The physical picture

Imagine tapping the surface of a pond. Disturbances propagate outward, interact with boundaries, and reveal information about the medium they travel through. Acoustic waves in the Earth behave differently in detail, but they share a fundamental idea: a disturbance evolves according to the properties of its environment.

For a simplified two-dimensional, constant-density acoustic medium, the wave equation may be written as

$$
\frac{\partial^2 p}{\partial t^2} = v^2(x,z)\left(\frac{\partial^2 p}{\partial x^2}+\frac{\partial^2 p}{\partial z^2}\right)+s(x,z,t)
$$

Here `p` is the wavefield, `v` is wave speed, and `s` is the source. The equation expresses a balance between temporal acceleration, spatial curvature, and forcing.

## 2. From a continuous field to a grid

A computer doesn't store infinitely many wavefield values. Instead, it samples the medium at discrete points, separated by `Δx` and `Δz`, and advances in increments of `Δt`.

The familiar central-difference approximation replaces a second derivative with a weighted combination of neighboring samples:

$$
\left.\frac{\partial^2 p}{\partial x^2}\right|_{i,j}\approx\frac{p_{i+1,j}-2p_{i,j}+p_{i-1,j}}{(\Delta x)^2}
$$

Applying similar approximations in space and time gives an explicit update: the future wavefield follows from its present and previous values, the spatial stencil, and the source.

## 3. Accuracy is a choice, not an automatic result

Discretization brings trade-offs. A grid that is too coarse cannot resolve short wavelengths accurately. A time step that is too large can destabilize the simulation. Even a stable model may suffer from numerical dispersion, where different components propagate at inaccurate speeds.

:::comparison
### Stability
Time and space sampling must satisfy the numerical scheme's stability conditions, often expressed through a CFL-type bound.

### Dispersion
Enough samples per wavelength—and a suitable spatial stencil—are needed to preserve physically meaningful propagation.
:::

## 4. Boundaries change everything

Finite computational domains have edges; physical wavefields typically do not. Without special treatment, numerical boundaries reflect energy back into the simulation. Absorbing boundaries and perfectly matched layers help approximate an unbounded medium, each with assumptions and implementation costs.

## 5. Why numerical modeling matters

Analytical solutions are invaluable but usually require idealized geometries or properties. Numerical methods let us explore heterogeneous structures, complex acquisition geometries, and interactions that have no practical closed-form solution.

This is the foundation of many seismic workflows: modeling predicted measurements, studying their sensitivity to Earth's properties, and iteratively improving an interpretation through inversion.

:::takeaway
Numerical modeling is not merely replacing calculus with arithmetic. It is designing a controlled approximation of physics—and knowing exactly what that approximation can and cannot be trusted to do.
:::
