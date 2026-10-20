# Spline interpolation

**Proposed title:** Natural cubic splines: from smooth curves to a tridiagonal system

**Source folder:** `/Users/kalmuteri/Dropbox/codeLab/experiments/numerics/spline`

### Available material

- `doc/spline_guide.tex` and its companion PDF: derivation, worked example, implementation discussion, and limitations.
- `cubic_spline.c` and `cubic_spline.h`: custom single-precision natural cubic spline implementation.
- `main.c`: 51 irregularly spaced samples, moving-average preprocessing, and 100 interpolation queries.
- `gsl_spline_example.c`: double-precision GSL comparison.
- `results.py`: curve overlay and an unnormalized L2 difference metric.
- `input.txt`, `custom_output.txt`, and `gsl_output.txt`: saved sample and interpolation outputs.

### Proposed outline

1. Distinguish interpolation from smoothing: preprocessing changes the samples; the spline interpolates the resulting values.
2. Join cubic segments with continuous values, first derivatives, and second derivatives.
3. Explain natural boundary conditions: zero endpoint curvature, not zero endpoint slope.
4. Derive the tridiagonal system and explain the Thomas algorithm.
5. Work through the three-point example, including the exact result S(0.5) = 0.6875.
6. Connect the equations to the C implementation.
7. Compare with GSL and explain numerical and modeling limitations.

### Work needed before publication

- Adapt the existing guide to the website Markdown template.
- Produce web-ready figures showing sample points, linear interpolation, and natural cubic interpolation.
- Add controlled checks for interpolation at knots, derivative continuity, natural boundary conditions, and the known worked example.
- Compare implementations using identical samples and query coordinates, retaining sufficient output precision.
- Resolve or explicitly document the evaluator's out-of-range access, incomplete input/allocation checks, and reverse-loop portability issue before presenting reusable code.
- Verify references and captions, then review equations and figures on desktop/mobile and in both themes.

### Evidence and limits from the initial inspection

The source and saved outputs were inspected; the demos were not rebuilt or executed. The saved outputs have a maximum absolute y difference of approximately 5.3e-6 and an L2 difference of approximately 1.64e-5. These are differences between exported curves, not isolated solver accuracy measurements: the programs generate data using different precision, query coordinates differ slightly, and default `%g` export rounds values.

Only natural boundary conditions are implemented. Clamped and periodic splines may be discussed as alternatives but should not be described as implemented experiments. An interactive Lab companion is optional future work, separate from the Writing article.


[Back to future topics](../future-articles.md)
