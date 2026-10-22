---
title: "Physics and machine | learning are *better together*"
page_title: "Physics and Machine Learning"
breadcrumb: "PHYSICS & AI"
subject: "AI & science"
subtitle: "Data-driven systems are powerful, but they become far more useful when we understand what the data can—and cannot—tell us."
summary: "How physics-based modeling and machine learning can complement one another in scientific computing."
type: "Perspective"
category: "technical"
topic: "AI & science"
slug: "physics-and-ai"
status: "published"
publication_date: "2026-10-14"
updated_date: "2026-10-16"
article_number: "002"
next_title: "From waves to computation"
next_url: "../from-waves-to-computation/"
---

:::idea
Physical models encode structure; machine learning discovers patterns. Used thoughtfully, they can reinforce one another rather than compete.
:::

## 1. Two complementary ways of knowing

Physics-based modeling starts with governing equations, boundary conditions, and a set of assumptions about how a system behaves. Machine learning, by contrast, extracts relationships from examples. Both are approximations. Their strengths depend on how well their assumptions match the problem.

A wave simulator can extrapolate into situations not present in a training dataset if the governing physics is appropriate. A learned model can represent complicated empirical effects that are prohibitively expensive—or impossible—to describe explicitly.

## 2. What physics contributes

Physical knowledge can act as a constraint, a source of synthetic training examples, an architectural prior, or a way to test whether model outputs are plausible. That does not mean every neural network needs a differential equation in its loss function. Sometimes the best contribution of physics is simply a better experimental design or a clear understanding of the measurements.

## 3. What machine learning contributes

Data-driven methods offer fast approximations, flexible feature extraction, and the ability to learn regularities in difficult, noisy datasets. In geophysics, promising applications include denoising, interpolation, deghosting, parameter estimation, and accelerating selected parts of computational workflows.

:::comparison
### Physics provides
Structure, interpretable constraints, conservation principles, synthetic data, and tests of plausibility.

### Learning provides
Expressive function approximation, computational speed after training, and flexibility with complex observations.
:::

## 4. The difficult part is generalization

An impressive test-set score may hide dependence on acquisition geometry, noise statistics, subsurface distributions, or preprocessing choices. A model trained on one survey may perform differently on another. Physics-informed methods can reduce some risks, but are not a guarantee of transferability.

Robust evaluation calls for out-of-distribution tests, interpretable quality measures, and comparisons against strong conventional baselines—not just attractive examples.

## 5. Build the right hybrid

The strongest approach depends on the task. Some problems benefit from embedding a differentiable physical operator within training. Others use neural networks as learned regularizers in an inverse problem, or reserve learned components for fast but bounded substeps. Sometimes a classical algorithm remains the most reliable option.

The useful question is not “Should we replace physics with AI?” It is “Which parts of this system are best represented by first principles, which are best learned from data, and how will we know that the combination works?”

:::takeaway
A credible scientific AI workflow treats both physics and data as sources of evidence, makes assumptions explicit, and tests performance under the conditions that matter.
:::
